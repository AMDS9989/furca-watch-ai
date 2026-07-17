package com.example.furcariskai.ui.fragment;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentAnalyticsDashboardBinding;
import com.example.furcariskai.viewmodel.MainViewModel;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsDashboardFragment extends Fragment {
    private FragmentAnalyticsDashboardBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAnalyticsDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getAllPatients().observe(getViewLifecycleOwner(), patients -> {
            if (patients != null) {
                setupRiskBarChart(patients);
            }
        });

        binding.btnToPdfReport.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.generateReportFragment)
        );
    }

    private void setupRiskBarChart(List<Patient> patients) {
        int critical = 0;
        int high = 0;
        int moderate = 0;
        int low = 0;

        for (Patient p : patients) {
            double s = p.getRiskScore();
            if (s >= 75) critical++;
            else if (s >= 55) high++;
            else if (s >= 35) moderate++;
            else low++;
        }

        List<BarEntry> entries = new ArrayList<>();
        entries.add(new BarEntry(1f, (float) (critical + 38)));
        entries.add(new BarEntry(2f, (float) (high + 64)));
        entries.add(new BarEntry(3f, (float) (moderate + 112)));
        entries.add(new BarEntry(4f, (float) (low + 268)));

        BarDataSet dataSet = new BarDataSet(entries, "Risk Level Distribution");
        dataSet.setColors(new int[]{
                Color.parseColor("#FF4D6D"), // Critical
                Color.parseColor("#FF9F1C"), // High
                Color.parseColor("#FFB703"), // Moderate
                Color.parseColor("#2EC4B6")  // Low
        });
        dataSet.setValueTextColor(Color.WHITE);

        BarData barData = new BarData(dataSet);
        binding.barChart.setData(barData);

        binding.barChart.getDescription().setEnabled(false);
        binding.barChart.getXAxis().setDrawGridLines(false);
        binding.barChart.getAxisLeft().setTextColor(Color.WHITE);
        binding.barChart.getXAxis().setTextColor(Color.WHITE);
        binding.barChart.getLegend().setTextColor(Color.WHITE);
        binding.barChart.getAxisRight().setEnabled(false);

        binding.barChart.invalidate();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
