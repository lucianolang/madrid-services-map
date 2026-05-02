# Madrid Services Map

A clean, modern web application to locate water fountains and public toilets in Madrid.

## Features

- 📍 **Real-time Location**: See your current position on the map.
- 🚰 **Service Markers**: Easy identification of water fountains and public toilets.
- 📱 **Service Details**: Tap any service to see details in a clean modal.
- 🗺️ **Navigation**: One-tap button to open the location in Google Maps or your default map app.
- ⚡ **Modern Stack**: Built with React, Tailwind CSS, Leaflet, and Lucide Icons.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

- `src/components/`: Modular UI components (Map, Modal, LocateButton).
- `public/data/`: GeoJSON data source for Madrid services.
- `src/App.jsx`: Main application logic and layout.
- `tailwind.config.js`: Tailwind CSS configuration for styling.

## Data Sources

The data is sourced from the Madrid City Council Open Data portal.
- Water Fountains: `fuentes_de_agua_madrid.geojson`
- Public Toilets: `aseos_publicos_madrid.geojson`
