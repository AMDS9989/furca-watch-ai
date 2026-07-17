package com.example.furcariskai.data.model;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "xray_images")
public class XRayImage {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String patientId = "";
    private String xrayPath = "";
    private String dateAdded = "";

    public XRayImage() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getXrayPath() { return xrayPath; }
    public void setXrayPath(String xrayPath) { this.xrayPath = xrayPath; }

    public String getDateAdded() { return dateAdded; }
    public void setDateAdded(String dateAdded) { this.dateAdded = dateAdded; }
}
