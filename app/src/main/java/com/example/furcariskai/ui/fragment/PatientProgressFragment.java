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
import com.example.furcariskai.databinding.FragmentPatientProgressBinding;
import com.example.furcariskai.viewmodel.MainViewModel;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;

import java.util.ArrayList;
import java.util.List;

public class PatientProgressFragment extends Fragment {
    private FragmentPatientProgressBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentPatientProgressBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                binding.tvPatientBrief.setText(patient.getName() + " Progress Summary");
                binding.tvMeanPdVal.setText(patient.getPocketDepth() + " mm");
                binding.tvBoneFillProgress.setText("+" + (6.0 - patient.getPocketDepth()) + " mm");

                setupProgressLineChart(patient);
            }
        });

        binding.btnToAnalytics.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.analyticsDashboardFragment)
        );
    }

    private void setupProgressLineChart(Patient patient) {
        List<Entry> entries = new ArrayList<>();
        entries.add(new Entry(1f, 6.2f)); // Month 1
        entries.add(new Entry(2f, 5.0f)); // Month 3
        entries.add(new Entry(3f, 4.2f)); // Month 6
        entries.add(new Entry(4f, (float) patient.getPocketDepth())); // Today

        LineDataSet dataSet = new LineDataSet(entries, "Mean Pocket Depth Trend");
        dataSet.setColor(Color.parseColor("#00F5D4"));
        dataSet.setCircleColor(Color.parseColor("#00F0FF"));
        dataSet.setValueTextColor(Color.WHITE);
        dataSet.setLineWidth(3f);
        dataSet.setCircleRadius(5f);

        LineData lineData = new LineData(dataSet);
        binding.lineChart.setData(lineData);
        
        binding.lineChart.getDescription().setEnabled(false);
        binding.lineChart.getXAxis().setDrawGridLines(false);
        binding.lineChart.getAxisLeft().setTextColor(Color.WHITE);
        binding.lineChart.getXAxis().setTextColor(Color.WHITE);
        binding.lineChart.getLegend().setTextColor(Color.WHITE);
        binding.lineChart.getAxisRight().setEnabled(false);

        binding.lineChart.invalidate(); // redraw
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
