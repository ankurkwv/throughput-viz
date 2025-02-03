# Throughput Viz

**Throughput Viz** is a collection of interactive web visualizations designed to illustrate how message throughput is managed under various queuing and rate-limiting scenarios. The demos simulate real-world messaging systems (for example, SMS throughput limits and multi-tenant traffic shaping) and visually demonstrate how messages are queued, processed, and prioritized under different policies.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Scenarios](#scenarios)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Code Structure](#code-structure)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Messaging platforms often need to manage message flow to ensure fairness and meet throughput limits. **Throughput Viz** provides animated SVG-based demos that simulate several queuing and rate-limiting strategies including:

- Per-sender queuing
- Account-based rate limiting (ABRL)
- Aggregated (market) queues
- Traffic shaping with priority weights
- Multi-tenant fairness (even and weighted)
- Combined multi-tenant and traffic shaping strategies

Each scenario demonstrates how messages move from an application through a provider (labeled as "Twlo" for Twilio) to end recipients, showing how messages are delayed or prioritized based on configured limits.

---

## Features

- Interactive animations that visualize messages queuing and processing in real time.
- Scenario-based demos where each HTML file represents a distinct scenario, making it easy to understand individual aspects of throughput management.
- Responsive design that uses SVG and JavaScript calculations to adjust element positioning on window resize.
- A modular architecture with separate HTML and JavaScript files for each scenario and shared utilities for consistency.
- An educational tool that visually explains industry concepts like ABRL, traffic shaping, and multi-tenancy.

---

## Scenarios

The repository includes multiple scenarios that you can run individually:

1. **Sender Queues:** Demonstrates individual sender queues with default throughput limits (for example, 100 messages per second).
2. **Account Based Rate Limit (ABRL):** Shows how an overall account-level throughput limit (for example, 300 MPS) affects message flow.
3. **Market Queue:** Aggregates traffic from multiple senders into a single carrier queue.
4. **Traffic Shaping:** Visualizes message prioritization based on traffic shaping (for example, 70% high-priority and 30% regular messages).
5. **Multitenancy (Even):** Demonstrates even distribution of throughput among multiple client accounts.
6. **Weighted Multitenancy:** Simulates scenarios where tenants are assigned different throughput weights.
7. **Multi-tenant with Traffic Shaping:** Combines multi-tenancy with priority-based traffic shaping.
8. **Sender Type Throughput:** Illustrates carrier-level throughput distribution with different weights for various carrier tiers.

---

## Technology Stack

- HTML5 and SVG for creating scalable, high-quality visual representations.
- CSS for styling pages and overlay text.
- JavaScript for animation and logic to simulate message flow.
- Anime.js, a lightweight JavaScript animation library, is used to power the animations.
- Plain JavaScript and DOM APIs provide interactive behaviors and dynamic layout adjustments.

---

## Installation

Since **Throughput Viz** is a static front-end project, installation is straightforward.

First, clone the repository by running the following command in your terminal:

git clone https://github.com/ankurkwv/throughput-viz.git

Then, change into the repository directory:

cd throughput-viz

Ensure that the repository’s directory structure remains intact. The project contains paired HTML and JavaScript files (for example, "1-sender-queues.html" with "1-sender-queues-script.js"), along with shared assets like "99-utils.js", "99-common_styles.css", and the Anime.js library.

---

## Usage

There is no build step or package manager required—simply open the HTML files in your browser.

1. Open a scenario by double-clicking an HTML file (for example, "1-sender-queues.html") to launch it in your default web browser. Alternatively, serve the files using a local web server such as Python’s "http.server".
2. Each scenario page includes a "Start Animation" button. Click the button to initiate the visualization.
3. Once the animation completes, you can click the "Restart Animation" button to replay the scenario.
4. Some scripts support an autoplay feature through a URL parameter. For example, appending "?autoplay=1" to the URL will automatically start the animation.

---

## Code Structure

- **HTML Files:** Each scenario has its own HTML file (such as "1-sender-queues.html", "2-abrl.html", etc.) that defines the SVG layout and includes the corresponding JavaScript.
- **JavaScript Files:** Each scenario’s behavior and animations are controlled by its respective script file (for example, "1-sender-queues-script.js").
- **Shared Utilities:**
  - "99-utils.js" contains helper functions for recalculating element positions on window resize, cloning SVG elements, and resetting animations.
  - "99-common_styles.css" provides consistent styling across all scenarios.
- **Animation Library:** The Anime.js library ("anime-3.2.1.min.js") is either loaded locally or via a CDN.

---

## Customization

You can customize the visualizations by modifying the scenario scripts:

- Adjust throughput limits by changing values such as messages per second (MPS) in the configuration arrays.
- Edit visual elements by modifying the SVG elements in the HTML files, including colors, labels, and shapes.
- Tweak animation timing by adjusting delay values or properties within the Anime.js timeline.
- Add new scenarios by creating additional HTML and JavaScript pairs, leveraging the shared utilities for consistency.

---

## Contributing

Contributions are welcome. If you have ideas for new scenarios, improvements to the animations, or additional documentation, please open an issue or submit a pull request.

When contributing:
- Fork the repository.
- Create a new branch for your feature or bug fix.
- Submit your changes via a pull request with a clear description of your changes.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- Anime.js – thanks to the creators for providing an excellent tool for creating smooth animations.
- The open source community – contributions and feedback from the community are greatly appreciated.
- ChatGPT wrote this README

Happy visualizing!
