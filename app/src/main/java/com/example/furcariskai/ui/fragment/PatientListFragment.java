package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
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
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentPatientListBinding;
import com.example.furcariskai.ui.adapter.PatientAdapter;
import com.example.furcariskai.viewmodel.MainViewModel;

import java.util.ArrayList;
import java.util.List;

public class PatientListFragment extends Fragment {
    private FragmentPatientListBinding binding;
    private MainViewModel viewModel;
    private PatientAdapter adapter;
    private List<Patient> fullList = new ArrayList<>();
    private String activeFilter = "all";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentPatientListBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        adapter = new PatientAdapter(patient -> {
            viewModel.setSelectedPatientId(patient.getId());
            viewModel.setSelectedTooth(patient.getToothNumber());
            Navigation.findNavController(view).navigate(R.id.patientProfileFragment);
        });

        binding.rvPatients.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvPatients.setAdapter(adapter);

        // Search Listener
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                viewModel.setSearchQuery(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Observers
        viewModel.getSearchedPatients().observe(getViewLifecycleOwner(), patients -> {
            if (patients != null) {
                fullList = patients;
                applyFilter();
            }
        });

        // Filter Chips Click Listeners
        binding.chipAll.setOnClickListener(v -> { activeFilter = "all"; applyFilter(); });
        binding.chipCritical.setOnClickListener(v -> { activeFilter = "critical"; applyFilter(); });
        binding.chipHigh.setOnClickListener(v -> { activeFilter = "high"; applyFilter(); });
        binding.chipModerate.setOnClickListener(v -> { activeFilter = "moderate"; applyFilter(); });
        binding.chipLow.setOnClickListener(v -> { activeFilter = "low"; applyFilter(); });

        binding.fabAddPatient.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.addPatientFragment)
        );
    }

    private void applyFilter() {
        if (activeFilter.equals("all")) {
            adapter.setList(fullList);
        } else {
            List<Patient> filtered = new ArrayList<>();
            for (Patient p : fullList) {
                String r = p.getRiskScore() >= 75 ? "critical" : p.getRiskScore() >= 55 ? "high" : p.getRiskScore() >= 35 ? "moderate" : "low";
                if (r.equalsIgnoreCase(activeFilter)) {
                    filtered.add(p);
                }
            }
            adapter.setList(filtered);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
