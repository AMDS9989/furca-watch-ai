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
import androidx.recyclerview.widget.LinearLayoutManager;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentAiAlertsBinding;
import com.example.furcariskai.ui.adapter.AlertAdapter;
import com.example.furcariskai.viewmodel.MainViewModel;

public class AIAlertsFragment extends Fragment {
    private FragmentAiAlertsBinding binding;
    private MainViewModel viewModel;
    private AlertAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAiAlertsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        adapter = new AlertAdapter(alert -> {
            viewModel.setSelectedPatientId(alert.getPatientId());
            Navigation.findNavController(view).navigate(R.id.patientProfileFragment);
        });

        binding.rvAlerts.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvAlerts.setAdapter(adapter);

        viewModel.getAllNotifications().observe(getViewLifecycleOwner(), alerts -> {
            if (alerts != null) {
                adapter.setList(alerts);
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
