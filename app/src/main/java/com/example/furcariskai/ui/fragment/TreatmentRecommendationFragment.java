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

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentTreatmentRecommendationBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class TreatmentRecommendationFragment extends Fragment {
    private FragmentTreatmentRecommendationBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentTreatmentRecommendationBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                double pct = patient.getRiskScore();
                if (pct >= 75) {
                    binding.tvTreatmentTitle1.setText("Guided Tissue Regeneration (GTR)");
                    binding.tvTreatmentDesc1.setText("Place bioresorbable collagen membrane over bifurcation crotch to guide osteogenesis.");
                    binding.tvTreatmentTitle2.setText("Surgical Bone Grafting");
                    binding.tvTreatmentDesc2.setText("Pack local particulate mineralized bone crystals directly into the cul-de-sac defect.");
                } else if (pct >= 35) {
                    binding.tvTreatmentTitle1.setText("Scaling & Root Planing (SRP)");
                    binding.tvTreatmentDesc1.setText("Deep sub-gingival debridement under local anesthesia to purge anaerobic biofilm.");
                    binding.tvTreatmentTitle2.setText("Bite force Adjusting");
                    binding.tvTreatmentDesc2.setText("Selective grinding of molar occlusal surfaces to relieve mechanical loading.");
                } else {
                    binding.tvTreatmentTitle1.setText("Routine Prophylaxis & Biofilm Control");
                    binding.tvTreatmentDesc1.setText("Perform standard scaling and apply localized stannous fluoride gels.");
                    binding.tvTreatmentTitle2.setText("Hygiene Monitoring");
                    binding.tvTreatmentDesc2.setText("Recall patient in 6 months for diagnostic probe measurement checkups.");
                }
            }
        });

        binding.btnNext.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.medicationFragment)
        );
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
