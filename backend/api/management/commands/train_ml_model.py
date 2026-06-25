from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Train the ML risk assessment model'

    def handle(self, *args, **options):
        try:
            self.stdout.write('🤖 Training ML model...')
            from api.ml_model import MLRiskAssessment
            ml = MLRiskAssessment()
            ml.train_model()
            self.stdout.write(
                self.style.SUCCESS('✅ ML model trained successfully!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ ML training error: {e}')
            )
            self.stdout.write(
                self.style.WARNING('⚠️ App will continue without ML model')
            )