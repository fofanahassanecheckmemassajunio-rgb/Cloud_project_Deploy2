import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score
import os

class SpamModel:
    def __init__(self, data_path=None):
        # Try multiple possible paths for the dataset
        if data_path is None:
            possible_paths = [
                r'C:\Users\Fofan\Downloads\archive\spam.csv',
                r'C:\Users\Fofan\OneDrive\Desktop\NLP_P1\spam.csv',
                'spam.csv',
                os.path.join(os.path.dirname(__file__), 'spam.csv'),
            ]
            
            self.data_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    self.data_path = path
                    break
            
            if self.data_path is None:
                self.data_path = possible_paths[0]  # Default to first path for error messages
        else:
            self.data_path = data_path
            
        self.model = None
        self.cv = None
        self.metrics = {}
        self.stats = {}
        self.is_trained = False
        self.prediction_counts = {'ham': 0, 'spam': 0}

    def train(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found. Please place 'spam.csv' in the project directory or at {self.data_path}")

        # 1. Load the dataset
        df = pd.read_csv(self.data_path, encoding='latin-1')

        # Clean the dataframe
        df = df[['v1', 'v2']]
        df.columns = ['label', 'message']

        # Precompute Stats for visualization
        ham_count = int(len(df[df['label'] == 'ham']))
        spam_count = int(len(df[df['label'] == 'spam']))
        
        # Calculate average lengths to provide more visualization data
        df['length'] = df['message'].apply(len)
        avg_ham_len = float(df[df['label'] == 'ham']['length'].mean() or 0)
        avg_spam_len = float(df[df['label'] == 'spam']['length'].mean() or 0)

        # 2. Convert labels to numbers (ham = 0, spam = 1)
        df['label'] = df['label'].map({'ham': 0, 'spam': 1})

        # 3. Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            df['message'], df['label'], test_size=0.2, random_state=42
        )

        # 4. Transform text into numbers
        self.cv = CountVectorizer()
        X_train_numeric = self.cv.fit_transform(X_train)
        X_test_numeric = self.cv.transform(X_test)

        # 5. Train the Model
        self.model = MultinomialNB()
        self.model.fit(X_train_numeric, y_train)

        # 6. Evaluate accuracy
        predictions = self.model.predict(X_test_numeric)
        acc = accuracy_score(y_test, predictions)
        
        # 7. Store metrics and stats
        self.metrics['accuracy'] = float(acc)
        self.stats = {
            'distribution': {'Ham': ham_count, 'Spam': spam_count},
            'avg_length': {'Ham': round(avg_ham_len, 1), 'Spam': round(avg_spam_len, 1)},
            'accuracy': round(float(acc) * 100, 2),  # Accuracy as percentage
            'total_messages': ham_count + spam_count
        }
        
        self.is_trained = True

        print(f"Model trained successfully. Accuracy: {acc*100:.2f}%")

    def predict(self, message):
        if not self.is_trained:
            raise Exception("Model is not trained yet.")
        
        data = self.cv.transform([message])
        result = self.model.predict(data)
        probability = self.model.predict_proba(data)[0].max() # Get confidence

        label = "SPAM" if result[0] == 1 else "HAM"
        
        # Track prediction counts
        if result[0] == 1:
            self.prediction_counts['spam'] += 1
        else:
            self.prediction_counts['ham'] += 1
        
        return {
            "prediction": label,
            "confidence": round(float(probability) * 100, 2)
        }

    def get_stats(self):
        # Add current prediction counts to stats
        stats_with_predictions = self.stats.copy()
        stats_with_predictions['predictions'] = self.prediction_counts
        return stats_with_predictions


