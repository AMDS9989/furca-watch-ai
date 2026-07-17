package com.example.furcariskai.data.model;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "reports")
public class Report {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String patientId = "";
    private String reportUuid = "";
    private String dateGenerated = "";
    private String filePath = "";

    public Report() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getReportUuid() { return reportUuid; }
    public void setReportUuid(String reportUuid) { this.reportUuid = reportUuid; }

    public String getDateGenerated() { return dateGenerated; }
    public void setDateGenerated(String dateGenerated) { this.dateGenerated = dateGenerated; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
}
