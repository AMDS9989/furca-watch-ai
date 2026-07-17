package com.example.furcariskai.data.model;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "medical_history")
public class MedicalHistory {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String patientId = "";
    private boolean smoking;
    private double hba1c;
    private boolean diabetes;
    private boolean familyHistory;
    private boolean osteoporosis;

    public MedicalHistory() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public boolean isSmoking() { return smoking; }
    public void setSmoking(boolean smoking) { this.smoking = smoking; }

    public double getHba1c() { return hba1c; }
    public void setHba1c(double hba1c) { this.hba1c = hba1c; }

    public boolean isDiabetes() { return diabetes; }
    public void setDiabetes(boolean diabetes) { this.diabetes = diabetes; }

    public boolean isFamilyHistory() { return familyHistory; }
    public void setFamilyHistory(boolean familyHistory) { this.familyHistory = familyHistory; }

    public boolean isOsteoporosis() { return osteoporosis; }
    public void setOsteoporosis(boolean osteoporosis) { this.osteoporosis = osteoporosis; }
}
