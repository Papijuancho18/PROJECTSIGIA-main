from rest_framework import serializers
from .models import ExportJob, ExportConfig
from accounts.serializers import UserSerializer

class ExportJobSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ExportJob
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'completed_at', 'status', 'file_path']

class ExportConfigSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ExportConfig
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
