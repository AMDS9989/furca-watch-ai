package com.example.furcariskai.data.model;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "patients")
public class Patient {
    @PrimaryKey
    @NonNull
    private String id = "";
    private String name = "";
    private int age;
    private String gender = "";
    private String phoneNumber = "";
    private boolean smoking;
    private boolean diabetes;
    private int pocketDepth;
    private int clinicalAttachmentLoss;
    private int plaqueIndex;
    private boolean bleeding;
    private int mobility;
    private String toothNumber = "";
    private String xrayPath = "";
    private double riskScore;
    private String treatment = "";
    private String doctorName = "Dr. Shahid";
    private String date = "";

    public Patient() {}

    @NonNull
    public String getId() { return id; }
    public void setId(@NonNull String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public boolean isSmoking() { return smoking; }
    public void setSmoking(boolean smoking) { this.smoking = smoking; }

    public boolean isDiabetes() { return diabetes; }
    public void setDiabetes(boolean diabetes) { this.diabetes = diabetes; }

    public int getPocketDepth() { return pocketDepth; }
    public void setPocketDepth(int pocketDepth) { this.pocketDepth = pocketDepth; }

    public int getClinicalAttachmentLoss() { return clinicalAttachmentLoss; }
    public void setClinicalAttachmentLoss(int clinicalAttachmentLoss) { this.clinicalAttachmentLoss = clinicalAttachmentLoss; }

    public int getPlaqueIndex() { return plaqueIndex; }
    public void setPlaqueIndex(int plaqueIndex) { this.plaqueIndex = plaqueIndex; }

    public boolean isBleeding() { return bleeding; }
    public void setBleeding(boolean bleeding) { this.bleeding = bleeding; }

    public int getMobility() { return mobility; }
    public void setMobility(int mobility) { this.mobility = mobility; }

    public String getToothNumber() { return toothNumber; }
    public void setToothNumber(String toothNumber) { this.toothNumber = toothNumber; }

    public String getXrayPath() { return xrayPath; }
    public void setXrayPath(String xrayPath) { this.xrayPath = xrayPath; }

    public double getRiskScore() { return riskScore; }
    public void setRiskScore(double riskScore) { this.riskScore = riskScore; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
