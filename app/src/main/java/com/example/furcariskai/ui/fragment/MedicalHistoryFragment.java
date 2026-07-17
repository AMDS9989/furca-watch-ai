package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentMedicalHistoryBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class MedicalHistoryFragment extends Fragment {
    private FragmentMedicalHistoryBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMedicalHistoryBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                binding.cbSmoking.setChecked(patient.isSmoking());
                binding.cbDiabetes.setChecked(patient.isDiabetes());
                binding.cbFamily.setChecked(patient.getAge() > 40); // mock genetics
                binding.cbOsteo.setChecked(patient.getGender().equalsIgnoreCase("Female"));
            }
        });

        binding.btnSave.setOnClickListener(v -> {
            if (activePatient != null) {
                activePatient.setSmoking(binding.cbSmoking.isChecked());
                activePatient.setDiabetes(binding.cbDiabetes.isChecked());
                
                // Update risk score based on medical factors
                double score = 15;
                if (activePatient.isSmoking()) score += 25;
                if (activePatient.isDiabetes()) score += 25;
                if (binding.cbFamily.isChecked()) score += 15;
                if (binding.cbOsteo.isChecked()) score += 10;
                activePatient.setRiskScore(score);

                viewModel.updatePatient(activePatient);
                Toast.makeText(getContext(), "Medical history co-factors updated", Toast.LENGTH_SHORT).show();
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
