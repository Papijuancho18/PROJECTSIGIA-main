from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import UserProfile
import csv
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Cargar usuarios desde un archivo CSV o JSON'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Ruta al archivo CSV o JSON con los datos de usuarios',
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'json'],
            default='csv',
            help='Formato del archivo (csv o json)',
        )
        parser.add_argument(
            '--sample',
            action='store_true',
            help='Crear usuarios de muestra',
        )

    def handle(self, *args, **options):
        if options['sample']:
            self.create_sample_users()
        elif options['file']:
            if options['format'] == 'csv':
                self.load_from_csv(options['file'])
            else:
                self.load_from_json(options['file'])
        else:
            self.stdout.write(
                self.style.ERROR('Debes especificar --file o --sample')
            )

    def create_sample_users(self):
        """Crear usuarios de muestra"""
        sample_data = [
            {
                'username': 'director.general',
                'email': 'director@universidad.edu',
                'first_name': 'Director',
                'last_name': 'General',
                'role': 'admin',
                'department': 'administration',
                'password': 'admin123',
            },
            {
                'username': 'coord.ingenieria',
                'email': 'coord.ing@universidad.edu',
                'first_name': 'Coordinador',
                'last_name': 'Ingeniería',
                'role': 'committee',
                'department': 'engineering',
                'password': 'coord123',
            },
            {
                'username': 'secre.academica',
                'email': 'secre@universidad.edu',
                'first_name': 'Secretaria',
                'last_name': 'Académica',
                'role': 'staff',
                'department': 'administration',
                'password': 'staff123',
            },
        ]
        
        self.load_users(sample_data)

    def load_from_csv(self, file_path):
        """Cargar usuarios desde archivo CSV"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                users_data = list(reader)
                self.load_users(users_data)
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'Archivo no encontrado: {file_path}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error leyendo CSV: {str(e)}')
            )

    def load_from_json(self, file_path):
        """Cargar usuarios desde archivo JSON"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                users_data = json.load(file)
                self.load_users(users_data)
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'Archivo no encontrado: {file_path}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error leyendo JSON: {str(e)}')
            )

    def load_users(self, users_data):
        """Cargar usuarios desde lista de datos"""
        created_count = 0
        updated_count = 0
        error_count = 0

        for user_data in users_data:
            try:
                username = user_data.get('username')
                if not username:
                    self.stdout.write(
                        self.style.WARNING('Usuario sin username, saltando...')
                    )
                    continue

                # Verificar si el usuario existe
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': user_data.get('email', ''),
                        'first_name': user_data.get('first_name', ''),
                        'last_name': user_data.get('last_name', ''),
                        'role': user_data.get('role', 'staff'),
                        'department': user_data.get('department', ''),
                        'phone': user_data.get('phone', ''),
                    }
                )

                # Establecer contraseña
                password = user_data.get('password', 'default123')
                user.set_password(password)
                user.save()

                # Crear perfil si no existe
                UserProfile.objects.get_or_create(user=user)

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Usuario creado: {username}')
                    )
                else:
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Usuario actualizado: {username}')
                    )

            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f'❌ Error con usuario {user_data.get("username", "desconocido")}: {str(e)}')
                )

        # Resumen
        self.stdout.write(
            self.style.SUCCESS(f'\n📊 Resumen:')
        )
        self.stdout.write(f'   - Usuarios creados: {created_count}')
        self.stdout.write(f'   - Usuarios actualizados: {updated_count}')
        self.stdout.write(f'   - Errores: {error_count}')
        self.stdout.write(f'   - Total de usuarios en sistema: {User.objects.count()}')
