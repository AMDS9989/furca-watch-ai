package com.example.furcariskai.data.model;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "scan_results")
public class ScanResult {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String patientId = "";
    private double riskPercentage;
    private double confidenceScore;
    private String riskLevel = "";
    private String affectedTooth = "";
    private double boneLossPercentage;
    private String heatmapCoords = "";
    private String recommendations = "";
    private String followUpDate = "";

    public ScanResult() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public double getRiskPercentage() { return riskPercentage; }
    public void setRiskPercentage(double riskPercentage) { this.riskPercentage = riskPercentage; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getAffectedTooth() { return affectedTooth; }
    public void setAffectedTooth(String affectedTooth) { this.affectedTooth = affectedTooth; }

    public double getBoneLossPercentage() { return boneLossPercentage; }
    public void setBoneLossPercentage(double boneLossPercentage) { this.boneLossPercentage = boneLossPercentage; }

    public String getHeatmapCoords() { return heatmapCoords; }
    public void setHeatmapCoords(String heatmapCoords) { this.heatmapCoords = heatmapCoords; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(String followUpDate) { this.followUpDate = followUpDate; }
}
