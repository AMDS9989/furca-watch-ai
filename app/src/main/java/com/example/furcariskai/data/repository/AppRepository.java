package com.example.furcariskai.data.repository;

import android.content.Context;
import android.util.Log;

import androidx.lifecycle.LiveData;

import com.example.furcariskai.data.dao.AppDao;
import com.example.furcariskai.data.database.AppDatabase;
import com.example.furcariskai.data.model.*;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentSnapshot;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONObject;

public class AppRepository {
    private static final String TAG = "AppRepository";
    private static final String API_BASE_URL = "http://10.0.2.2:3000/api";
    private final AppDao appDao;
    private final ExecutorService executorService;
    private FirebaseFirestore firestore;
    private final OkHttpClient httpClient = new OkHttpClient();

    public AppRepository(Context context) {
        AppDatabase db = AppDatabase.getDatabase(context);
        appDao = db.appDao();
        executorService = Executors.newFixedThreadPool(4);
        try {
            firestore = FirebaseFirestore.getInstance();
            setupFirestoreSync();
        } catch (Exception e) {
            Log.e(TAG, "Firebase Firestore initialization failed: ", e);
        }
    }

    private void syncPatientToBackend(Patient p) {
        try {
            JSONObject json = new JSONObject();
            json.put("id", p.getId());
            json.put("name", p.getName());
            json.put("age", p.getAge());
            json.put("gender", p.getGender());
            json.put("phoneNumber", p.getPhoneNumber());
            json.put("smoking", p.isSmoking());
            json.put("diabetes", p.isDiabetes());
            json.put("pocketDepth", p.getPocketDepth());
            json.put("clinicalAttachmentLoss", p.getClinicalAttachmentLoss());
            json.put("plaqueIndex", p.getPlaqueIndex());
            json.put("bleeding", p.isBleeding());
            json.put("mobility", p.getMobility());
            json.put("toothNumber", p.getToothNumber());
            json.put("riskScore", p.getRiskScore());
            json.put("treatment", p.getTreatment());
            json.put("doctorName", p.getDoctorName());
            json.put("date", p.getDate());

            RequestBody body = RequestBody.create(
                json.toString(),
                MediaType.get("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                .url(API_BASE_URL + "/patients")
                .post(body)
                .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.w(TAG, "Sync patient to backend failed: " + e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        Log.w(TAG, "Sync patient to backend returned error: " + response.code());
                    } else {
                        Log.i(TAG, "Patient synced to backend: " + p.getId());
                    }
                    response.close();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Failed to build JSON for patient sync", e);
        }
    }

    private void deletePatientFromBackend(String patientId) {
        Request request = new Request.Builder()
            .url(API_BASE_URL + "/patients/" + patientId)
            .delete()
            .build();

        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.w(TAG, "Delete patient from backend failed: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.w(TAG, "Delete patient from backend returned error: " + response.code());
                } else {
                    Log.i(TAG, "Patient deleted from backend: " + patientId);
                }
                response.close();
            }
        });
    }

    private void syncAppointmentToBackend(Appointment a) {
        try {
            JSONObject json = new JSONObject();
            json.put("patientId", a.getPatientId());
            json.put("patientName", a.getPatientName());
            json.put("date", a.getDate());
            json.put("time", a.getTime());
            json.put("goal", a.getGoal());

            RequestBody body = RequestBody.create(
                json.toString(),
                MediaType.get("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                .url(API_BASE_URL + "/appointments")
                .post(body)
                .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.w(TAG, "Sync appointment failed: " + e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    response.close();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Failed to build JSON for appointment sync", e);
        }
    }

    private void syncNotificationToBackend(Notification n) {
        try {
            JSONObject json = new JSONObject();
            json.put("patientId", n.getPatientId());
            json.put("patientName", n.getPatientName());
            json.put("date", n.getDate());
            json.put("message", n.getMessage());
            json.put("type", n.getType());
            json.put("read", n.isRead());

            RequestBody body = RequestBody.create(
                json.toString(),
                MediaType.get("application/json; charset=utf-8")
            );

            Request request = new Request.Builder()
                .url(API_BASE_URL + "/notifications")
                .post(body)
                .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.w(TAG, "Sync notification failed: " + e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    response.close();
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Failed to build JSON for notification sync", e);
        }
    }

    private void setupFirestoreSync() {
        if (firestore == null) return;

        // Synchronize patients
        firestore.collection("patients").addSnapshotListener((snapshots, e) -> {
            if (e != null) {
                Log.w(TAG, "Patients listen failed.", e);
                return;
            }
            if (snapshots != null) {
                executorService.execute(() -> {
                    for (DocumentSnapshot doc : snapshots.getDocuments()) {
                        try {
                            Patient p = doc.toObject(Patient.class);
                            if (p != null) {
                                appDao.insertPatient(p);
                            }
                        } catch (Exception ex) {
                            Log.e(TAG, "Error deserializing patient", ex);
                        }
                    }
                });
            }
        });

        // Synchronize appointments
        firestore.collection("appointments").addSnapshotListener((snapshots, e) -> {
            if (e != null || snapshots == null) return;
            executorService.execute(() -> {
                for (DocumentSnapshot doc : snapshots.getDocuments()) {
                    try {
                        Appointment a = doc.toObject(Appointment.class);
                        if (a != null) {
                            appDao.insertAppointment(a);
                        }
                    } catch (Exception ex) {
                        Log.e(TAG, "Error deserializing appointment", ex);
                    }
                }
            });
        });

        // Synchronize notifications
        firestore.collection("notifications").addSnapshotListener((snapshots, e) -> {
            if (e != null || snapshots == null) return;
            executorService.execute(() -> {
                for (DocumentSnapshot doc : snapshots.getDocuments()) {
                    try {
                        Notification n = doc.toObject(Notification.class);
                        if (n != null) {
                            appDao.insertNotification(n);
                        }
                    } catch (Exception ex) {
                        Log.e(TAG, "Error deserializing notification", ex);
                    }
                }
            });
        });
    }

    public ExecutorService getExecutor() {
        return executorService;
    }

    // Patient transactions
    public void insertPatient(Patient p) {
        executorService.execute(() -> {
            appDao.insertPatient(p);
            syncPatientToBackend(p);
        });
        if (firestore != null) {
            try {
                firestore.collection("patients").document(p.getId()).set(p);
            } catch (Exception e) {
                Log.e(TAG, "Failed to write patient to Firestore: ", e);
            }
        }
    }

    public void updatePatient(Patient p) {
        executorService.execute(() -> {
            appDao.updatePatient(p);
            syncPatientToBackend(p);
        });
        if (firestore != null) {
            try {
                firestore.collection("patients").document(p.getId()).set(p);
            } catch (Exception e) {
                Log.e(TAG, "Failed to update patient in Firestore: ", e);
            }
        }
    }

    public void deletePatient(Patient p) {
        executorService.execute(() -> {
            appDao.deletePatient(p);
            deletePatientFromBackend(p.getId());
        });
        if (firestore != null) {
            try {
                firestore.collection("patients").document(p.getId()).delete();
            } catch (Exception e) {
                Log.e(TAG, "Failed to delete patient from Firestore: ", e);
            }
        }
    }

    public LiveData<Patient> getPatientById(String id) {
        return appDao.getPatientById(id);
    }

    public Patient getPatientByIdSync(String id) {
        return appDao.getPatientByIdSync(id);
    }

    public LiveData<List<Patient>> getAllPatients() {
        return appDao.getAllPatients();
    }

    public LiveData<List<Patient>> searchPatients(String query) {
        return appDao.searchPatients("%" + query + "%");
    }

    // Appointment transactions
    public void insertAppointment(Appointment a) {
        executorService.execute(() -> {
            appDao.insertAppointment(a);
            syncAppointmentToBackend(a);
            if (firestore != null) {
                try {
                    firestore.collection("appointments").document(String.valueOf(a.getId())).set(a);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write appointment to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<Appointment>> getAllAppointments() {
        return appDao.getAllAppointments();
    }

    public LiveData<List<Appointment>> getAppointmentsForDate(String date) {
        return appDao.getAppointmentsForDate(date);
    }

    // Medical History transactions
    public void insertMedicalHistory(MedicalHistory mh) {
        executorService.execute(() -> {
            appDao.insertMedicalHistory(mh);
            if (firestore != null) {
                try {
                    firestore.collection("medical_history").document(String.valueOf(mh.getId())).set(mh);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write medical history to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<MedicalHistory> getMedicalHistoryForPatient(String pid) {
        return appDao.getMedicalHistoryForPatient(pid);
    }

    // Clinical Measurements transactions
    public void insertClinicalMeasurement(ClinicalMeasurement cm) {
        executorService.execute(() -> {
            appDao.insertClinicalMeasurement(cm);
            if (firestore != null) {
                try {
                    firestore.collection("clinical_measurements").document(String.valueOf(cm.getId())).set(cm);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write clinical measurement to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<ClinicalMeasurement>> getMeasurementsForPatient(String pid) {
        return appDao.getMeasurementsForPatient(pid);
    }

    // X-Ray Images transactions
    public void insertXRayImage(XRayImage img) {
        executorService.execute(() -> {
            appDao.insertXRayImage(img);
            if (firestore != null) {
                try {
                    firestore.collection("xray_images").document(String.valueOf(img.getId())).set(img);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write X-Ray to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<XRayImage>> getXRaysForPatient(String pid) {
        return appDao.getXRaysForPatient(pid);
    }

    // Scan Results transactions
    public void insertScanResult(ScanResult res) {
        executorService.execute(() -> {
            appDao.insertScanResult(res);
            if (firestore != null) {
                try {
                    firestore.collection("scan_results").document(String.valueOf(res.getId())).set(res);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write scan result to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<ScanResult>> getScanResultsForPatient(String pid) {
        return appDao.getScanResultsForPatient(pid);
    }

    // Treatments transactions
    public void insertTreatment(Treatment t) {
        executorService.execute(() -> {
            appDao.insertTreatment(t);
            if (firestore != null) {
                try {
                    firestore.collection("treatments").document(String.valueOf(t.getId())).set(t);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write treatment to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<Treatment>> getTreatmentsForPatient(String pid) {
        return appDao.getTreatmentsForPatient(pid);
    }

    // Reports transactions
    public void insertReport(Report r) {
        executorService.execute(() -> {
            appDao.insertReport(r);
            if (firestore != null) {
                try {
                    firestore.collection("reports").document(String.valueOf(r.getId())).set(r);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write report to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<Report>> getReportsForPatient(String pid) {
        return appDao.getReportsForPatient(pid);
    }

    // Notifications transactions
    public void insertNotification(Notification n) {
        executorService.execute(() -> {
            appDao.insertNotification(n);
            syncNotificationToBackend(n);
            if (firestore != null) {
                try {
                    firestore.collection("notifications").document(String.valueOf(n.getId())).set(n);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to write notification to Firestore: ", e);
                }
            }
        });
    }

    public LiveData<List<Notification>> getAllNotifications() {
        return appDao.getAllNotifications();
    }
}
