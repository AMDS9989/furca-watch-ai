package com.example.furcariskai.ui.fragment;

import android.animation.ValueAnimator;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentRiskScoreBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class RiskScoreFragment extends Fragment {
    private FragmentRiskScoreBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentRiskScoreBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                double pct = patient.getRiskScore();
                
                // Animate circular progress and text
                animateGauge(pct);

                String r = pct >= 75 ? "CRITICAL" : pct >= 55 ? "HIGH" : pct >= 35 ? "MODERATE" : "LOW";
                binding.tvRiskLabel.setText(r);

                int colorRes = R.color.status_green;
                if (pct >= 75) colorRes = R.color.status_critical;
                else if (pct >= 55) colorRes = R.color.status_warning;
                else if (pct >= 35) colorRes = R.color.status_warning;

                binding.tvRiskLabel.setTextColor(ContextCompat.getColor(requireContext(), colorRes));
                
                // Risk details explainers
                binding.tvExplainText.setText("Clinical pocket depth (" + patient.getPocketDepth() + "mm) combined with " + 
                        (patient.isSmoking() ? "active tobacco smoking" : "systemic glycemic indices") + 
                        " results in a " + r.toLowerCase() + " probability of furcation collapse in molar #" + patient.getToothNumber() + ".");
            }
        });

        binding.btnNext.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.furcationGradeFragment)
        );
    }

    private void animateGauge(double targetPct) {
        ValueAnimator animator = ValueAnimator.ofFloat(0, (float) targetPct);
        animator.setDuration(1200);
        animator.setInterpolator(new DecelerateInterpolator());
        animator.addUpdateListener(animation -> {
            float val = (float) animation.getAnimatedValue();
            if (binding != null) {
                binding.tvPercentage.setText(String.format("%.1f%%", val));
                binding.circularProgress.setProgress((int) val);
            }
        });
        animator.start();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
