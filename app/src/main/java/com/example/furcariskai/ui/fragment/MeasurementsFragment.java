package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.SeekBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentMeasurementsBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class MeasurementsFragment extends Fragment {
    private FragmentMeasurementsBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMeasurementsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                binding.tvPatientNameBrief.setText(patient.getName());
                binding.tvActiveToothBadge.setText("Tooth #" + patient.getToothNumber());
                
                binding.sbPd.setProgress(patient.getPocketDepth() - 1);
                binding.tvPdValue.setText(patient.getPocketDepth() + " mm");

                binding.sbCal.setProgress(patient.getClinicalAttachmentLoss());
                binding.tvCalValue.setText(patient.getClinicalAttachmentLoss() + " mm");

                binding.toggleBop.setChecked(patient.isBleeding());
                binding.spinnerPlaque.setSelection(patient.getPlaqueIndex());
                binding.spinnerMobility.setSelection(patient.getMobility());
            }
        });

        // Seekbar Listeners
        binding.sbPd.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                binding.tvPdValue.setText((progress + 1) + " mm");
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.sbCal.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                binding.tvCalValue.setText(progress + " mm");
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.btnSave.setOnClickListener(v -> {
            if (activePatient != null) {
                activePatient.setPocketDepth(binding.sbPd.getProgress() + 1);
                activePatient.setClinicalAttachmentLoss(binding.sbCal.getProgress());
                activePatient.setBleeding(binding.toggleBop.isChecked());
                activePatient.setPlaqueIndex(binding.spinnerPlaque.getSelectedItemPosition());
                activePatient.setMobility(binding.spinnerMobility.getSelectedItemPosition());

                // Calculate updated risk score
                double score = activePatient.getRiskScore();
                if (activePatient.getPocketDepth() >= 5) score = Math.min(100, score + 10);
                if (activePatient.isBleeding()) score = Math.min(100, score + 8);
                activePatient.setRiskScore(score);

                viewModel.updatePatient(activePatient);
                Toast.makeText(getContext(), "Clinical profile updated", Toast.LENGTH_SHORT).show();
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
