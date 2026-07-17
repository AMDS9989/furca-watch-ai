package com.example.furcariskai.data.model;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "treatments")
public class Treatment {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private String patientId = "";
    private String title = "";
    private String details = "";
    private String priority = "";
    private String datePrescribed = "";

    public Treatment() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDatePrescribed() { return datePrescribed; }
    public void setDatePrescribed(String datePrescribed) { this.datePrescribed = datePrescribed; }
}
