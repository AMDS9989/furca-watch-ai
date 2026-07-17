package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentDashboardBinding;
import com.example.furcariskai.ui.adapter.AppointmentAdapter;
import com.example.furcariskai.viewmodel.MainViewModel;

public class DashboardFragment extends Fragment {
    private FragmentDashboardBinding binding;
    private MainViewModel viewModel;
    private AppointmentAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        // RecyclerView Setup
        adapter = new AppointmentAdapter(appt -> {
            viewModel.setSelectedPatientId(appt.getPatientId());
            Navigation.findNavController(view).navigate(R.id.patientProfileFragment);
        });
        binding.rvAppointments.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvAppointments.setAdapter(adapter);

        // Observers
        viewModel.getAllPatients().observe(getViewLifecycleOwner(), patients -> {
            if (patients != null) {
                binding.tvTotalPatients.setText(String.valueOf(patients.size() + 250));
                
                int criticalCount = 0;
                int lowCount = 0;
                for (com.example.furcariskai.data.model.Patient p : patients) {
                    if (p.getRiskScore() >= 75) {
                        criticalCount++;
                    } else if (p.getRiskScore() < 35) {
                        lowCount++;
                    }
                }
                binding.tvHighRisk.setText(String.valueOf(criticalCount + 35));
                binding.tvLowRisk.setText(String.valueOf(lowCount + 120));
                binding.tvTotalScans.setText(String.valueOf(patients.size() * 4 + 1100));
            }
        });

        viewModel.getAllAppointments().observe(getViewLifecycleOwner(), appts -> {
            if (appts != null) {
                adapter.setList(appts);
            }
        });

        // Click Actions
        binding.layoutAlertBanner.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.aiAlertsFragment)
        );
        binding.btnRunScan.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.uploadXRayFragment)
        );
        binding.btnAddPatient.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.addPatientFragment)
        );
        binding.btnAssistant.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.aiAssistantFragment)
        );
        binding.btnHospital.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.hospitalDashboardFragment)
        );
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
