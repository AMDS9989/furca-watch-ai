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
import com.example.furcariskai.databinding.FragmentRootAnatomyBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class RootAnatomyFragment extends Fragment {
    private FragmentRootAnatomyBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentRootAnatomyBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                binding.tvActiveMolarBadge.setText("Tooth #" + patient.getToothNumber());
                
                binding.sbRootTrunk.setProgress(patient.getPocketDepth() * 8); // mock mapping
                binding.tvRootTrunkValue.setText("4.0 mm");

                binding.sbDivergence.setProgress(25);
                binding.tvDivergenceValue.setText("25°");

                binding.sbEntrance.setProgress(12);
                binding.tvEntranceValue.setText("1.2 mm");
            }
        });

        binding.sbRootTrunk.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                double val = 1.0 + (progress / 10.0);
                binding.tvRootTrunkValue.setText(String.format("%.1f mm", val));
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.sbDivergence.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                binding.tvDivergenceValue.setText(progress + "°");
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.sbEntrance.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                double val = 0.5 + (progress / 20.0);
                binding.tvEntranceValue.setText(String.format("%.1f mm", val));
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.btnNext.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Root anatomy parameters locked", Toast.LENGTH_SHORT).show();
            Navigation.findNavController(view).navigate(R.id.occlusalLoadFragment);
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
