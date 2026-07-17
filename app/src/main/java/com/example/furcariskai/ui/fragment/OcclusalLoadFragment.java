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

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentOcclusalLoadBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class OcclusalLoadFragment extends Fragment {
    private FragmentOcclusalLoadBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentOcclusalLoadBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                binding.tvToothNumTitle.setText("Occlusal Load (Tooth #" + patient.getToothNumber() + ")");
                binding.sbBiteForce.setProgress(600); // Default simulated
                binding.tvBiteForceVal.setText("600 N");
                binding.tvTraumaStatus.setText("Present (Overload)");
                binding.tvTraumaStatus.setTextColor(getResources().getColor(R.color.status_critical));
            }
        });

        binding.sbBiteForce.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                int force = 100 + progress;
                binding.tvBiteForceVal.setText(force + " N");
                viewModel.setSimulatedBiteForce((double) force);
                
                if (force > 600) {
                    binding.tvTraumaStatus.setText("Present (Overload)");
                    binding.tvTraumaStatus.setTextColor(getResources().getColor(R.color.status_critical));
                } else if (force > 400) {
                    binding.tvTraumaStatus.setText("Borderline");
                    binding.tvTraumaStatus.setTextColor(getResources().getColor(R.color.status_warning));
                } else {
                    binding.tvTraumaStatus.setText("Normal");
                    binding.tvTraumaStatus.setTextColor(getResources().getColor(R.color.status_green));
                }
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.btnLock.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Occlusal load locked", Toast.LENGTH_SHORT).show();
            Navigation.findNavController(view).navigate(R.id.medicalHistoryFragment);
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
