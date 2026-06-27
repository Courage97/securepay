from django.core.management.base import BaseCommand
import os
import sys


class Command(BaseCommand):
    help = 'Train the ML risk assessment model'

    def handle(self, *args, **options):
        try:
            self.stdout.write('🤖 Checking ML model...')

            # Get absolute path to ml_engine
            BASE_DIR = os.path.dirname(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.abspath(__file__))
                    )
                )
            )
            ML_ENGINE_PATH = os.path.join(BASE_DIR, 'ml_engine')
            model_path = os.path.join(ML_ENGINE_PATH, 'pharming_model.pkl')

            self.stdout.write(f'📁 ML Engine Path: {ML_ENGINE_PATH}')
            self.stdout.write(f'📁 Model exists: {os.path.exists(model_path)}')

            # If model already exists, skip training
            if os.path.exists(model_path):
                self.stdout.write(
                    self.style.SUCCESS('✅ Pre-trained ML model found - no retraining needed!')
                )
                return

            # Model doesn't exist - train it
            self.stdout.write('🧠 Training new ML model...')

            if ML_ENGINE_PATH not in sys.path:
                sys.path.insert(0, ML_ENGINE_PATH)

            # Change to ml_engine directory so relative paths work
            original_dir = os.getcwd()
            os.chdir(ML_ENGINE_PATH)

            try:
                # Dynamically import train_model from the ml_engine directory
                import importlib
                try:
                    tm = importlib.import_module('train_model')
                except Exception:
                    # Fallback: try loading by spec in case static import fails
                    import importlib.util
                    spec = importlib.util.spec_from_file_location('train_model', os.path.join(ML_ENGINE_PATH, 'train_model.py'))
                    tm = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(tm)

                PharmingDetectionModel = getattr(tm, 'PharmingDetectionModel')
                import pandas as pd

                model = PharmingDetectionModel()
                df = model.load_data('training_data.csv')
                model.train(df)
                model.save_model(
                    model_path='pharming_model.pkl',
                    scaler_path='scaler.pkl'
                )
            finally:
                os.chdir(original_dir)

            self.stdout.write(
                self.style.SUCCESS('✅ ML model trained and saved!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ ML error: {e}')
            )
            self.stdout.write(
                self.style.WARNING('⚠️ App will use fallback risk assessment')
            )