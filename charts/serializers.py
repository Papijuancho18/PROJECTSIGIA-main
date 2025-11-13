from rest_framework import serializers
from .models import Chart, ChartData


class ChartDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartData
        fields = '__all__'


class ChartSerializer(serializers.ModelSerializer):
    data = ChartDataSerializer(many=True, read_only=True)
    
    class Meta:
        model = Chart
        fields = '__all__'


class ChartCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chart
        fields = ['name', 'chart_type', 'description', 'config']
