package com.example.furcariskai.data.model;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "clinical_measurements")
public class ClinicalMeasurement {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String patientId = "";
    private String toothNumber = "";
    private int pocketDepth;
    private int clinicalAttachmentLoss;
    private int plaqueIndex;
    private int gingivalIndex;
    private boolean bleeding;
    private int mobility;

    public ClinicalMeasurement() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getToothNumber() { return toothNumber; }
    public void setToothNumber(String toothNumber) { this.toothNumber = toothNumber; }

    public int getPocketDepth() { return pocketDepth; }
    public void setPocketDepth(int pocketDepth) { this.pocketDepth = pocketDepth; }

    public int getClinicalAttachmentLoss() { return clinicalAttachmentLoss; }
    public void setClinicalAttachmentLoss(int clinicalAttachmentLoss) { this.clinicalAttachmentLoss = clinicalAttachmentLoss; }

    public int getPlaqueIndex() { return plaqueIndex; }
    public void setPlaqueIndex(int plaqueIndex) { this.plaqueIndex = plaqueIndex; }

    public int getGingivalIndex() { return gingivalIndex; }
    public void setGingivalIndex(int gingivalIndex) { this.gingivalIndex = gingivalIndex; }

    public boolean isBleeding() { return bleeding; }
    public void setBleeding(boolean bleeding) { this.bleeding = bleeding; }

    public int getMobility() { return mobility; }
    public void setMobility(int mobility) { this.mobility = mobility; }
}
