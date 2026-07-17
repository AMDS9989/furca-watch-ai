package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentCreateProfileBinding;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.HashMap;
import java.util.Map;

public class CreateProfileFragment extends Fragment {
    private static final String TAG = "CreateProfileFragment";
    private FragmentCreateProfileBinding binding;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCreateProfileBinding.inflate(inflater, container, false);
        try {
            mAuth = FirebaseAuth.getInstance();
            db = FirebaseFirestore.getInstance();
        } catch (Exception e) {
            Log.e(TAG, "Firebase initialization failed: ", e);
        }
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.btnSaveProfile.setOnClickListener(v -> {
            String fullName = binding.etFullName.getText().toString().trim();
            String clinicName = binding.etClinicName.getText().toString().trim();
            String specialty = binding.etSpecialty.getText().toString().trim();
            String phone = binding.etPhone.getText().toString().trim();

            if (TextUtils.isEmpty(fullName) || TextUtils.isEmpty(clinicName)) {
                Toast.makeText(getContext(), "Full Name and Clinic Name are required", Toast.LENGTH_SHORT).show();
                return;
            }

            if (mAuth == null || mAuth.getCurrentUser() == null || db == null) {
                Toast.makeText(getContext(), "Firebase not configured. Navigating in Demo Mode.", Toast.LENGTH_LONG).show();
                Navigation.findNavController(view).navigate(R.id.dashboardFragment);
                return;
            }

            String uid = mAuth.getCurrentUser().getUid();
            Map<String, Object> userProfile = new HashMap<>();
            userProfile.put("uid", uid);
            userProfile.put("fullName", fullName);
            userProfile.put("clinicName", clinicName);
            userProfile.put("specialty", specialty);
            userProfile.put("phone", phone);

            binding.btnSaveProfile.setEnabled(false);
            db.collection("users").document(uid).set(userProfile)
                .addOnCompleteListener(task -> {
                    binding.btnSaveProfile.setEnabled(true);
                    if (task.isSuccessful()) {
                        Toast.makeText(getContext(), "Profile saved successfully", Toast.LENGTH_SHORT).show();
                        Navigation.findNavController(view).navigate(R.id.dashboardFragment);
                    } else {
                        String errMsg = task.getException() != null ? task.getException().getMessage() : "Failed to save profile";
                        Toast.makeText(getContext(), errMsg, Toast.LENGTH_LONG).show();
                    }
                });
        });

        binding.btnBypass.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.dashboardFragment)
        );
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
