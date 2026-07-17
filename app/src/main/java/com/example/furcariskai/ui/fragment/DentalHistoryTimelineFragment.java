package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.example.furcariskai.databinding.FragmentDentalHistoryTimelineBinding;
import com.example.furcariskai.ui.adapter.TimelineAdapter;
import com.example.furcariskai.viewmodel.MainViewModel;

import java.util.ArrayList;
import java.util.List;

public class DentalHistoryTimelineFragment extends Fragment {
    private FragmentDentalHistoryTimelineBinding binding;
    private MainViewModel viewModel;
    private TimelineAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDentalHistoryTimelineBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        adapter = new TimelineAdapter();
        binding.rvTimeline.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvTimeline.setAdapter(adapter);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                binding.tvPatientTitle.setText(patient.getName() + " Visit History");
                
                List<String> dates = new ArrayList<>();
                List<String> events = new ArrayList<>();
                List<String> descs = new ArrayList<>();

                dates.add(patient.getDate());
                events.add("AI Prognostic Scan Run");
                descs.add("Risk assessment (" + String.format("%.1f%%", patient.getRiskScore()) + ") completed on Tooth #" + patient.getToothNumber());

                dates.add("2026-06-10");
                events.add("Periodontal Screening");
                descs.add("Baseline probe pocket depth " + patient.getPocketDepth() + "mm recorded by Dr. Shahid.");

                dates.add("2026-02-18");
                events.add("Initial Consultation");
                descs.add("Referred by general clinic for localized molar attachment loss check.");

                adapter.setData(dates, events, descs);
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
