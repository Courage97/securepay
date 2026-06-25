from django.core.management.base import BaseCommand
from api.models import User


class Command(BaseCommand):
    help = 'Create default superuser if none exists'

    def handle(self, *args, **options):
        # Check if superuser already exists
        if not User.objects.filter(is_superuser=True).exists():
            try:
                user = User.objects.create_superuser(
                    username='admin',
                    email='oyewolebarnabas97@gmail.com',
                    password='SecurePay@Admin123'
                )
                user.is_superuser = True
                user.is_staff = True
                user.save()
                self.stdout.write(
                    self.style.SUCCESS('✅ Superuser created successfully!')
                )
                self.stdout.write(
                    self.style.SUCCESS('Username: admin')
                )
                self.stdout.write(
                    self.style.SUCCESS('Password: SecurePay@Admin123')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error creating superuser: {e}')
                )
        else:
            self.stdout.write(
                self.style.WARNING('⚠️ Superuser already exists - skipping')
            )