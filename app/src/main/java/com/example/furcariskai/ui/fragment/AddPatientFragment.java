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
import com.example.furcariskai.databinding.FragmentAddPatientBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class AddPatientFragment extends Fragment {
    private FragmentAddPatientBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAddPatientBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        binding.btnCancel.setOnClickListener(v -> Navigation.findNavController(view).navigateUp());

        binding.btnSave.setOnClickListener(v -> {
            String name = binding.etName.getText().toString().trim();
            String ageStr = binding.etAge.getText().toString().trim();
            String id = binding.etId.getText().toString().trim();
            String phone = binding.etPhone.getText().toString().trim();
            String gender = binding.spinnerGender.getSelectedItem().toString();

            if (name.isEmpty() || ageStr.isEmpty() || id.isEmpty()) {
                Toast.makeText(getContext(), "Please fill all required fields", Toast.LENGTH_SHORT).show();
                return;
            }

            int age = Integer.parseInt(ageStr);
            boolean smoking = binding.cbSmoking.isChecked();
            boolean diabetes = binding.cbDiabetes.isChecked();

            // Calculate mock risk based on risk factors
            double score = 15;
            if (smoking) score += 25;
            if (diabetes) score += 25;
            if (binding.cbHygiene.isChecked()) score += 20;
            if (binding.cbSystemic.isChecked()) score += 15;

            Patient patient = new Patient();
            patient.setId(id);
            patient.setName(name);
            patient.setAge(age);
            patient.setGender(gender);
            patient.setPhoneNumber(phone.isEmpty() ? "+1 (555) 000-0000" : phone);
            patient.setSmoking(smoking);
            patient.setDiabetes(diabetes);
            patient.setRiskScore(score);
            patient.setToothNumber("16");
            patient.setDoctorName("Dr. Shahid");
            
            String currentDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());
            patient.setDate(currentDate);

            // Database Save
            viewModel.insertPatient(patient);
            Toast.makeText(getContext(), "Patient profile created successfully", Toast.LENGTH_SHORT).show();

            // Navigate back
            Navigation.findNavController(view).navigateUp();
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
