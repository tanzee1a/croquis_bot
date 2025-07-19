import discord
from discord.ext import commands
import os
import random
import asyncio
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

# --- SETUP ---
load_dotenv()
BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CHANNEL_ID = int(os.getenv("DISCORD_CHANNEL_ID"))
UPLOAD_FOLDER = 'uploads'
STATIC_IMAGE_FOLDER = 'images'

# --- BOT & FLASK INITIALIZATION ---
# Define bot intents
intents = discord.Intents.default()
intents.message_content = True # Necessary for some commands

# Use commands.Bot to allow for both slash commands and client events
bot = commands.Bot(command_prefix="!", intents=intents)

# Flask app initialization
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://croquisbot.netlify.app"}})
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- SESSION MANAGEMENT ---
# A simple in-memory flag to prevent multiple sessions
session_active = False
# Store settings from web upload
session_settings = {
    "timer": 30,
    "count": 5,
    "images": []
}

# --- DISCORD BOT LOGIC ---

@bot.event
async def on_ready():
    print(f"Bot is ready! Logged in as {bot.user}")
    await bot.tree.sync() # Sync slash commands

# Functionality 1: Solo/Random Session via Slash Command
@bot.tree.command(name="start_random_croquis", description="Start a quick session with random images.")
async def start_random_croquis(interaction: discord.Interaction, num_images: int = 5, timer_duration: int = 30):
    global session_active
    if session_active:
        await interaction.response.send_message("A session is already in progress. Please wait for it to complete.", ephemeral=True)
        return
    
    # 1. Defer the response immediately to avoid the 3-second timeout
    await interaction.response.defer()

    session_active = True
    
    # 2. Use interaction.followup.send for the first message after deferring
    await interaction.followup.send(f"Starting a random croquis session with {num_images} images for {timer_duration} seconds each!")
    # ... rest of the function

    image_pool = [os.path.join(STATIC_IMAGE_FOLDER, img) for img in os.listdir(STATIC_IMAGE_FOLDER) if img.endswith(('.png', '.jpg', '.jpeg'))]
    if not image_pool:
        await interaction.followup.send("No static images found for a random session.")
        session_active = False
        return
        
    session_images = random.sample(image_pool, min(num_images, len(image_pool)))
    channel = interaction.channel

    for i, image_path in enumerate(session_images):
        if not session_active:
            await channel.send("Session has been canceled.")
            break
        await channel.send(f"Image {i+1}:", file=discord.File(image_path))
        await asyncio.sleep(timer_duration)
        if i < len(session_images) - 1:
            await channel.send("Time's up! Next image...")

    if session_active:
        await channel.send("Croquis session complete! 🎉")
    session_active = False

@bot.tree.command(name="cancel", description="Cancel the current croquis session.")
async def cancel(interaction: discord.Interaction):
    global session_active
    if not session_active:
        await interaction.response.send_message("No session is currently active.", ephemeral=True)
        return
    
    session_active = False
    await interaction.response.send_message("The croquis session has been cancelled.")

# --- FLASK WEB SERVER LOGIC ---

# Functionality 2: Custom Session from Web Dashboard
@app.route('/upload', methods=['POST'])
def upload_images():
    uploaded_files = request.files.getlist("images")
    timer = int(request.form.get("timer", 30))
    count = len(uploaded_files) # Get the count directly from the number of files

    # Clear previous uploads
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    for f in os.listdir(UPLOAD_FOLDER):
        os.remove(os.path.join(UPLOAD_FOLDER, f))

    saved_files = []
    for file in uploaded_files:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        saved_files.append(filepath)

    # Store settings for the session
    session_settings["timer"] = timer
    session_settings["count"] = count # Store the actual number of images
    session_settings["images"] = saved_files
    
    print(f"Received {len(saved_files)} images. Session configured for {count} images at {timer}s each.")
    return jsonify({"message": "Files uploaded successfully and session is ready.", "uploaded_files": len(saved_files)})

@app.route('/start-session', methods=['POST'])
def start_session_endpoint():
    global session_active
    if session_active:
        return jsonify({"message": "A session is already in progress."}), 409 # Conflict

    # Run the Discord session logic in the bot's event loop
    bot.loop.create_task(run_custom_discord_session())
    return jsonify({"message": "Session started in Discord!"})

async def run_custom_discord_session():
    """The bot's logic for a custom session, triggered by the web."""
    global session_active
    session_active = True
    
    channel = bot.get_channel(CHANNEL_ID)
    if not channel:
        print(f"Error: Channel with ID {CHANNEL_ID} not found.")
        session_active = False
        return

    timer = session_settings["timer"]
    count = min(session_settings["count"], len(session_settings["images"]))
    images = session_settings["images"]
    random.shuffle(images)

    await channel.send(f"Starting a custom croquis session with {count} images for {timer} seconds each!")

    for i in range(count):
        if not session_active:
            await channel.send("Custom session has been canceled.")
            break
        await channel.send(f"Image {i+1} of {count}:", file=discord.File(images[i]))
        await asyncio.sleep(timer)
        if i < len(images) - 1:
            await channel.send("Time's up! Next image...")
    
    if session_active:
        await channel.send("Custom session complete! 🎉")
    session_active = False


# --- MAIN EXECUTION ---

# This is the NEW code
def run_flask_app():
    # Get the port from the environment variable Render sets
    port = int(os.environ.get('PORT', 5000))
    # Runs the Flask app on the correct host and port
    app.run(host='0.0.0.0', port=port)

if __name__ == '__main__':
    # Run Flask in its own thread
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.start()
    
    # Run the bot in the main thread
    bot.run(BOT_TOKEN)