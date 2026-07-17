package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentToothSelectionBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class ToothSelectionFragment extends Fragment {
    private FragmentToothSelectionBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;
    private String selectedTooth = "16";
    private String selectedJaw = "upper";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentToothSelectionBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                selectedTooth = patient.getToothNumber();
                selectedJaw = patient.getAge() > 40 ? "upper" : "lower"; // default jaw mapping
                updateToothButtonsUI();
            }
        });

        binding.btnUpperJaw.setOnClickListener(v -> {
            selectedJaw = "upper";
            binding.btnUpperJaw.setSelected(true);
            binding.btnLowerJaw.setSelected(false);
            binding.layoutUpperArch.setVisibility(View.VISIBLE);
            binding.layoutLowerArch.setVisibility(View.GONE);
        });

        binding.btnLowerJaw.setOnClickListener(v -> {
            selectedJaw = "lower";
            binding.btnUpperJaw.setSelected(false);
            binding.btnLowerJaw.setSelected(true);
            binding.layoutUpperArch.setVisibility(View.GONE);
            binding.layoutLowerArch.setVisibility(View.VISIBLE);
        });

        // Set listeners for all tooth buttons
        setupToothButton(binding.btnTooth18, "18");
        setupToothButton(binding.btnTooth17, "17");
        setupToothButton(binding.btnTooth16, "16");
        setupToothButton(binding.btnTooth26, "26");
        setupToothButton(binding.btnTooth27, "27");
        setupToothButton(binding.btnTooth28, "28");
        setupToothButton(binding.btnTooth38, "38");
        setupToothButton(binding.btnTooth37, "37");
        setupToothButton(binding.btnTooth36, "36");
        setupToothButton(binding.btnTooth46, "46");
        setupToothButton(binding.btnTooth47, "47");
        setupToothButton(binding.btnTooth48, "48");

        binding.btnConfirm.setOnClickListener(v -> {
            if (activePatient != null) {
                activePatient.setToothNumber(selectedTooth);
                viewModel.updatePatient(activePatient);
                viewModel.setSelectedTooth(selectedTooth);
                viewModel.setSelectedJaw(selectedJaw);
                Navigation.findNavController(view).navigate(R.id.rootAnatomyFragment);
            }
        });
    }

    private void setupToothButton(Button btn, String toothNum) {
        btn.setOnClickListener(v -> {
            selectedTooth = toothNum;
            updateToothButtonsUI();
        });
    }

    private void updateToothButtonsUI() {
        binding.btnTooth18.setSelected(selectedTooth.equals("18"));
        binding.btnTooth17.setSelected(selectedTooth.equals("17"));
        binding.btnTooth16.setSelected(selectedTooth.equals("16"));
        binding.btnTooth26.setSelected(selectedTooth.equals("26"));
        binding.btnTooth27.setSelected(selectedTooth.equals("27"));
        binding.btnTooth28.setSelected(selectedTooth.equals("28"));
        binding.btnTooth38.setSelected(selectedTooth.equals("38"));
        binding.btnTooth37.setSelected(selectedTooth.equals("37"));
        binding.btnTooth36.setSelected(selectedTooth.equals("36"));
        binding.btnTooth46.setSelected(selectedTooth.equals("46"));
        binding.btnTooth47.setSelected(selectedTooth.equals("47"));
        binding.btnTooth48.setSelected(selectedTooth.equals("48"));

        if (selectedJaw.equals("upper")) {
            binding.btnUpperJaw.performClick();
        } else {
            binding.btnLowerJaw.performClick();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
