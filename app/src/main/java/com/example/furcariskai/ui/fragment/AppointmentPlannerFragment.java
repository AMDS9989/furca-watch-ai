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

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Appointment;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentAppointmentPlannerBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class AppointmentPlannerFragment extends Fragment {
    private FragmentAppointmentPlannerBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAppointmentPlannerBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
            }
        });

        binding.btnSchedule.setOnClickListener(v -> {
            if (activePatient == null) {
                Toast.makeText(getContext(), "No active patient selected", Toast.LENGTH_SHORT).show();
                return;
            }

            String date = binding.etDate.getText().toString().trim();
            String time = binding.spinnerTime.getSelectedItem().toString();
            String reason = binding.spinnerReason.getSelectedItem().toString();
            String doctor = binding.spinnerDoctor.getSelectedItem().toString();

            if (date.isEmpty()) {
                Toast.makeText(getContext(), "Please select a date", Toast.LENGTH_SHORT).show();
                return;
            }

            Appointment appt = new Appointment();
            appt.setPatientId(activePatient.getId());
            appt.setPatientName(activePatient.getName());
            appt.setDate(date);
            appt.setTime(time);
            appt.setReason(reason);
            appt.setDoctorName(doctor);

            viewModel.insertAppointment(appt);
            Toast.makeText(getContext(), "Appointment scheduled successfully", Toast.LENGTH_SHORT).show();
            
            // Navigate back to Dashboard
            Navigation.findNavController(view).navigate(R.id.dashboardFragment);
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
