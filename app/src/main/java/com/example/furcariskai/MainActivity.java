package com.example.furcariskai;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.ui.NavigationUI;

import com.example.furcariskai.data.model.Appointment;
import com.example.furcariskai.data.model.Notification;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.ActivityMainBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class MainActivity extends AppCompatActivity {
    private ActivityMainBinding binding;
    private MainViewModel viewModel;
    private static final int REQUEST_CODE_PERMISSIONS = 1001;
    private static final String[] REQUIRED_PERMISSIONS = new String[]{
            Manifest.permission.CAMERA
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        viewModel = new ViewModelProvider(this).get(MainViewModel.class);

        // Setup Navigation Host and Controller
        NavHostFragment navHostFragment = (NavHostFragment) getSupportFragmentManager()
                .findFragmentById(R.id.nav_host_fragment);
        if (navHostFragment != null) {
            NavController navController = navHostFragment.getNavController();
            NavigationUI.setupWithNavController(binding.bottomNavigation, navController);

            // Hide bottom navigation on splash and welcome screens
            navController.addOnDestinationChangedListener((controller, destination, arguments) -> {
                int id = destination.getId();
                if (id == R.id.splashFragment || id == R.id.welcomeFragment) {
                    binding.bottomNavigation.setVisibility(View.GONE);
                } else {
                    binding.bottomNavigation.setVisibility(View.VISIBLE);
                }
            });
        }

        // Request Permissions
        if (!allPermissionsGranted()) {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS);
        }

        // Prepopulate database with mock patients if database is empty
        prepopulateDatabase();
    }

    private boolean allPermissionsGranted() {
        for (String permission : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    private void prepopulateDatabase() {
        viewModel.getAllPatients().observe(this, patients -> {
            if (patients == null || patients.isEmpty()) {
                // Prepopulate
                Patient p1 = new Patient();
                p1.setId("FR-23091");
                p1.setName("Johnathan Smith");
                p1.setAge(42);
                p1.setGender("Male");
                p1.setPhoneNumber("+1 (555) 019-2831");
                p1.setSmoking(true);
                p1.setDiabetes(true);
                p1.setPocketDepth(5);
                p1.setClinicalAttachmentLoss(4);
                p1.setPlaqueIndex(2);
                p1.setBleeding(true);
                p1.setMobility(1);
                p1.setToothNumber("16");
                p1.setRiskScore(84.2);
                p1.setTreatment("Guided Tissue Regeneration (GTR) & Bone Grafting");
                p1.setDoctorName("Dr. Shahid");
                p1.setDate("2026-07-14");
                viewModel.insertPatient(p1);

                Patient p2 = new Patient();
                p2.setId("FR-84022");
                p2.setName("Eleanor Vance");
                p2.setAge(58);
                p2.setGender("Female");
                p2.setPhoneNumber("+1 (555) 304-9812");
                p2.setSmoking(false);
                p2.setDiabetes(false);
                p2.setPocketDepth(4);
                p2.setClinicalAttachmentLoss(3);
                p2.setPlaqueIndex(2);
                p2.setBleeding(true);
                p2.setMobility(0);
                p2.setToothNumber("46");
                p2.setRiskScore(68.5);
                p2.setTreatment("Scaling & Root Planing (SRP)");
                p2.setDoctorName("Dr. Shahid");
                p2.setDate("2026-07-10");
                viewModel.insertPatient(p2);

                Patient p3 = new Patient();
                p3.setId("FR-11209");
                p3.setName("Robert Miller");
                p3.setAge(35);
                p3.setGender("Male");
                p3.setPhoneNumber("+1 (555) 890-4109");
                p3.setSmoking(true);
                p3.setDiabetes(false);
                p3.setPocketDepth(3);
                p3.setClinicalAttachmentLoss(2);
                p3.setPlaqueIndex(1);
                p3.setBleeding(false);
                p3.setMobility(0);
                p3.setToothNumber("26");
                p3.setRiskScore(45.1);
                p3.setTreatment("Sub-gingival Biofilm Debridement");
                p3.setDoctorName("Dr. Shahid");
                p3.setDate("2026-06-25");
                viewModel.insertPatient(p3);

                Patient p4 = new Patient();
                p4.setId("FR-50210");
                p4.setName("Sophia Martinez");
                p4.setAge(29);
                p4.setGender("Female");
                p4.setPhoneNumber("+1 (555) 762-2309");
                p4.setSmoking(false);
                p4.setDiabetes(false);
                p4.setPocketDepth(2);
                p4.setClinicalAttachmentLoss(0);
                p4.setPlaqueIndex(0);
                p4.setBleeding(false);
                p4.setMobility(0);
                p4.setToothNumber("36");
                p4.setRiskScore(18.3);
                p4.setTreatment("Prophylaxis & Oral Hygiene Instruction");
                p4.setDoctorName("Dr. Shahid");
                p4.setDate("2026-07-01");
                viewModel.insertPatient(p4);

                // Add mock appointments
                Appointment a1 = new Appointment();
                a1.setPatientId("FR-23091");
                a1.setPatientName("Johnathan Smith");
                a1.setDate("2026-07-14");
                a1.setTime("09:00 AM");
                a1.setReason("AI Diagnostic Scan");
                viewModel.insertAppointment(a1);

                Appointment a2 = new Appointment();
                a2.setPatientId("FR-84022");
                a2.setPatientName("Eleanor Vance");
                a2.setDate("2026-07-14");
                a2.setTime("10:30 AM");
                a2.setReason("Regenerative Recall");
                viewModel.insertAppointment(a2);

                // Add default notifications
                Notification n1 = new Notification();
                n1.setAlertType("CRITICAL");
                n1.setPatientId("FR-23091");
                n1.setPatientName("Johnathan Smith");
                n1.setMessage("Bite force of 720N exceeding threshold for Patient Johnathan Smith (Grade II Molar #16).");
                n1.setTimestamp("10m ago");
                viewModel.insertNotification(n1);

                Notification n2 = new Notification();
                n2.setAlertType("HIGH");
                n2.setPatientId("FR-84022");
                n2.setPatientName("Eleanor Vance");
                n2.setMessage("Worsening attachment loss (4mm) predicted for Patient Eleanor Vance.");
                n2.setTimestamp("1h ago");
                viewModel.insertNotification(n2);
            }
        });
    }
}
