# AI Spam Guardian 🛡️

A premium, modern web application that classifies incoming messages as either Safe (HAM) or Spiteful (SPAM), utilizing a fine-tuned Naive Bayes model powered by `scikit-learn`.

## Features
- ✨ **Beautiful Glassmorphism Interface**: Sleek dark mode design leveraging CSS variables and backdrop filters.
- 🚀 **Real-time API Endpoint**: Submit message predictions asynchronously via `/predict`.
- 📊 **Dynamic Visualizations**: Utilizes Chart.js to render dataset distributions (analyzing exact class splits from the training data).
- 🧠 **Robust AI Model**: Automatically trains a Multinomial Naive Bayes model on initialization.

## Requirements
To run this application, verify you have Python 3.8+ installed alongside the required frameworks:
```bash
pip install flask pandas scikit-learn
```

Make sure the training dataset is located locally on your machine at:
`C:\Users\Fofan\Downloads\archive\spam.csv`
*(If your dataset moves, update the `data_path` assignment in `model.py` and the UI alert in `index.html`!)*

## Running the Web App

1. Ensure the dataset exists in the correct folder path.
2. Run the Flask server:
```bash
c;s
```
3. Open your browser and navigate to: `http://localhost:5000`

## Implementation Details
- `app.py`: Contains the REST API routing logic and serves HTML.
- `model.py`: Wraps standard Data Scientist workflows into an accessible Object-Oriented interface for evaluating the NLP model.
- `static/`: Contains the dynamic visual scripting (`app.js`) and modern styling sheets (`style.css`).
- `templates/`: Houses the HTML skeleton built iteratively.
