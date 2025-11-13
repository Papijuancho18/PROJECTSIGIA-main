from rest_framework import serializers
from .models import Report, ReportVersion, ReportComment


class ReportVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = ReportVersion
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')


class ReportCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ReportComment
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['title', 'description', 'template', 'content', 'assigned_to', 'due_date']


class ReportSerializer(serializers.ModelSerializer):
    versions = ReportVersionSerializer(many=True, read_only=True)
    comments = ReportCommentSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')
