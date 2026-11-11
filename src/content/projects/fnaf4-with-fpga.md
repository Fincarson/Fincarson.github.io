---
title: FNAF4_with_FPGA
slug: fnaf4-with-fpga
order: 1
featured: true
summary: Five Nights at Freddy's 4 recreated as pure digital logic on an FPGA, with no processor and no operating system.
highlights:
  - Wrote the FPGA design in Verilog
  - Used Xilinx Vivado
  - Runs on a Digilent Basys 3 (Xilinx Artix-7) with VGA video, a PS/2 keyboard and I2S audio
about:
  - The whole game is a circuit on the chip. The game logic, the VGA timing, the audio driver and the keyboard interface all run at the same time, kept in order by a single clock. Nothing underneath it executes code.
  - The design drives a VGA display at 640x480, reads a PS/2 keyboard and produces I2S audio. The board's switches set the volume, and the LEDs and the seven-segment display show status and the countdown. It runs on a Digilent Basys 3 board (Xilinx Artix-7 XC7A35T).
play:
  - At the main menu, press Enter to begin the night.
  - From the main room, press A or D to look left or right.
  - Press W to step up to a door, then F to shine the flashlight down the hall. Bonnie approaches from one side and Chica from the other.
  - If one of them is there, press Space to shut the door. Press S to step back into the room.
  - Survive until the night's timer runs out and you win. If one reaches you, a jumpscare ends the night.
playSteps: true
built:
  - I wrote the design in Verilog with Xilinx Vivado 2019.2.
  - "It is split into small modules: a game state machine, rendering and VGA timing, the two characters, PS/2 keyboard input, audio, and the board's LEDs and seven-segment display."
  - The artwork (menus, rooms, doors, characters and jumpscares) is held in on-chip Block RAM.
  - A small Python utility in the repository converts each image into the memory format the Block RAM cores load at build time.
  - The repository includes a prebuilt bitstream for the Basys 3 and the Vivado project to build it from source.
solo: true
members:
  - Vincent Jefferson (solo project)
  - Art by a friend
stack:
  - Verilog
  - Xilinx Vivado
repo: https://github.com/Fincarson/FNAF4_with_FPGA
media:
  - src: ../../assets/projects/fnaf4-with-fpga/nightmare-bonnie.png
    alt: Nightmare Bonnie, a dark purple rabbit animatronic with sharp teeth, leaning into a doorway. Pixel art by a friend, taken from the game's own Block RAM asset.
    pixel: true
---
