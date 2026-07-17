package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentPatientProfileBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class PatientProfileFragment extends Fragment {
    private FragmentPatientProfileBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentPatientProfileBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                binding.tvName.setText(patient.getName());
                binding.tvId.setText("ID: " + patient.getId());
                binding.tvGenderAge.setText(patient.getGender() + " • Age " + patient.getAge());
                binding.tvPhone.setText(patient.getPhoneNumber());
                binding.tvToothNum.setText("Tooth #" + patient.getToothNumber());
                
                String r = patient.getRiskScore() >= 75 ? "CRITICAL" : patient.getRiskScore() >= 55 ? "HIGH" : patient.getRiskScore() >= 35 ? "MODERATE" : "LOW";
                binding.tvRiskStatus.setText(r);
                binding.tvConfidenceScore.setText(String.format("%.1f%%", patient.getRiskScore()));

                int colorRes = R.color.status_green;
                if (patient.getRiskScore() >= 75) colorRes = R.color.status_critical;
                else if (patient.getRiskScore() >= 55) colorRes = R.color.status_warning;
                else if (patient.getRiskScore() >= 35) colorRes = R.color.status_warning;

                binding.tvRiskStatus.setTextColor(ContextCompat.getColor(requireContext(), colorRes));
            }
        });

        // Quick navigation shortcuts
        binding.btnMeasurements.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.measurementsFragment)
        );
        binding.btnToothSelect.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.toothSelectionFragment)
        );
        binding.btnAnatomy.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.rootAnatomyFragment)
        );
        binding.btnOcclusion.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.occlusalLoadFragment)
        );
        binding.btnSystemic.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.medicalHistoryFragment)
        );
        binding.btnScanXray.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.uploadXRayFragment)
        );

        // Footer Actions
        binding.btnHistory.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.dentalHistoryTimelineFragment)
        );
        binding.btnForecast.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.uploadXRayFragment)
        );

        binding.btnDeletePatient.setOnClickListener(v -> {
            if (activePatient != null) {
                viewModel.deletePatient(activePatient);
                Toast.makeText(getContext(), "Patient profile deleted", Toast.LENGTH_SHORT).show();
                Navigation.findNavController(view).navigateUp();
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
