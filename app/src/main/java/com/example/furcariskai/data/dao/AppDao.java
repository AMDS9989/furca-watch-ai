package com.example.furcariskai.data.dao;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Update;

import com.example.furcariskai.data.model.*;

import java.util.List;

@Dao
public interface AppDao {
    // Patient queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertPatient(Patient patient);

    @Update
    void updatePatient(Patient patient);

    @Delete
    void deletePatient(Patient patient);

    @Query("SELECT * FROM patients WHERE id = :id LIMIT 1")
    LiveData<Patient> getPatientById(String id);

    @Query("SELECT * FROM patients WHERE id = :id LIMIT 1")
    Patient getPatientByIdSync(String id);

    @Query("SELECT * FROM patients ORDER BY name ASC")
    LiveData<List<Patient>> getAllPatients();

    @Query("SELECT * FROM patients WHERE name LIKE :query OR id LIKE :query ORDER BY name ASC")
    LiveData<List<Patient>> searchPatients(String query);

    // Appointment queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertAppointment(Appointment appointment);

    @Query("SELECT * FROM appointments ORDER BY date ASC, time ASC")
    LiveData<List<Appointment>> getAllAppointments();

    @Query("SELECT * FROM appointments WHERE date = :date ORDER BY time ASC")
    LiveData<List<Appointment>> getAppointmentsForDate(String date);

    // Medical History queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertMedicalHistory(MedicalHistory history);

    @Query("SELECT * FROM medical_history WHERE patientId = :patientId LIMIT 1")
    LiveData<MedicalHistory> getMedicalHistoryForPatient(String patientId);

    // Clinical Measurements queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertClinicalMeasurement(ClinicalMeasurement measurement);

    @Query("SELECT * FROM clinical_measurements WHERE patientId = :patientId ORDER BY id DESC")
    LiveData<List<ClinicalMeasurement>> getMeasurementsForPatient(String patientId);

    // X-Ray Images queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertXRayImage(XRayImage xray);

    @Query("SELECT * FROM xray_images WHERE patientId = :patientId ORDER BY id DESC")
    LiveData<List<XRayImage>> getXRaysForPatient(String patientId);

    // Scan Results queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertScanResult(ScanResult result);

    @Query("SELECT * FROM scan_results WHERE patientId = :patientId ORDER BY id DESC")
    LiveData<List<ScanResult>> getScanResultsForPatient(String patientId);

    // Treatments queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertTreatment(Treatment treatment);

    @Query("SELECT * FROM treatments WHERE patientId = :patientId ORDER BY id DESC")
    LiveData<List<Treatment>> getTreatmentsForPatient(String patientId);

    // Reports queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertReport(Report report);

    @Query("SELECT * FROM reports WHERE patientId = :patientId ORDER BY id DESC")
    LiveData<List<Report>> getReportsForPatient(String patientId);

    // Notifications queries
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertNotification(Notification notification);

    @Query("SELECT * FROM notifications ORDER BY id DESC")
    LiveData<List<Notification>> getAllNotifications();
}
