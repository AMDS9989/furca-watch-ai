package com.example.furcariskai.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Transformations;

import com.example.furcariskai.data.model.*;
import com.example.furcariskai.data.repository.AppRepository;

import java.util.List;

public class MainViewModel extends AndroidViewModel {
    private final AppRepository repository;
    private final LiveData<List<Patient>> allPatients;
    private final LiveData<List<Appointment>> allAppointments;
    private final LiveData<List<Notification>> allNotifications;

    private final MutableLiveData<String> searchQuery = new MutableLiveData<>("");
    private final LiveData<List<Patient>> searchedPatients;

    private final MutableLiveData<String> selectedPatientId = new MutableLiveData<>("");
    private final LiveData<Patient> selectedPatient;

    private final MutableLiveData<String> selectedTooth = new MutableLiveData<>("16");
    private final MutableLiveData<String> selectedJaw = new MutableLiveData<>("upper");
    private final MutableLiveData<String> xrayPath = new MutableLiveData<>("");
    private final MutableLiveData<Double> simulatedBiteForce = new MutableLiveData<>(350.0);

    public MainViewModel(@NonNull Application application) {
        super(application);
        repository = new AppRepository(application);
        allPatients = repository.getAllPatients();
        allAppointments = repository.getAllAppointments();
        allNotifications = repository.getAllNotifications();

        searchedPatients = Transformations.switchMap(searchQuery, query -> {
            if (query == null || query.trim().isEmpty()) {
                return repository.getAllPatients();
            } else {
                return repository.searchPatients(query);
            }
        });

        selectedPatient = Transformations.switchMap(selectedPatientId, id -> {
            if (id == null || id.isEmpty()) {
                return new MutableLiveData<>(null);
            }
            return repository.getPatientById(id);
        });
    }

    public LiveData<List<Patient>> getAllPatients() { return allPatients; }
    public LiveData<List<Appointment>> getAllAppointments() { return allAppointments; }
    public LiveData<List<Notification>> getAllNotifications() { return allNotifications; }

    public void setSearchQuery(String query) { searchQuery.setValue(query); }
    public LiveData<List<Patient>> getSearchedPatients() { return searchedPatients; }

    public void setSelectedPatientId(String id) { selectedPatientId.setValue(id); }
    public LiveData<Patient> getSelectedPatient() { return selectedPatient; }

    public void setSelectedTooth(String tooth) { selectedTooth.setValue(tooth); }
    public LiveData<String> getSelectedTooth() { return selectedTooth; }

    public void setSelectedJaw(String jaw) { selectedJaw.setValue(jaw); }
    public LiveData<String> getSelectedJaw() { return selectedJaw; }

    public void setXrayPath(String path) { xrayPath.setValue(path); }
    public LiveData<String> getXrayPath() { return xrayPath; }

    public void setSimulatedBiteForce(double force) { simulatedBiteForce.setValue(force); }
    public LiveData<Double> getSimulatedBiteForce() { return simulatedBiteForce; }

    // Database Actions
    public void insertPatient(Patient p) { repository.insertPatient(p); }
    public void updatePatient(Patient p) { repository.updatePatient(p); }
    public void deletePatient(Patient p) { repository.deletePatient(p); }

    public void insertAppointment(Appointment a) { repository.insertAppointment(a); }
    public void insertNotification(Notification n) { repository.insertNotification(n); }
    public void insertScanResult(ScanResult r) { repository.insertScanResult(r); }
    public void insertTreatment(Treatment t) { repository.insertTreatment(t); }
    public void insertReport(Report r) { repository.insertReport(r); }

    public LiveData<List<ScanResult>> getScanResultsForPatient(String pid) {
        return repository.getScanResultsForPatient(pid);
    }

    public LiveData<List<Treatment>> getTreatmentsForPatient(String pid) {
        return repository.getTreatmentsForPatient(pid);
    }

    public LiveData<List<Report>> getReportsForPatient(String pid) {
        return repository.getReportsForPatient(pid);
    }
}
