package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentSignUpBinding;
import com.google.firebase.auth.FirebaseAuth;

public class SignUpFragment extends Fragment {
    private static final String TAG = "SignUpFragment";
    private FragmentSignUpBinding binding;
    private FirebaseAuth mAuth;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSignUpBinding.inflate(inflater, container, false);
        try {
            mAuth = FirebaseAuth.getInstance();
        } catch (Exception e) {
            Log.e(TAG, "Firebase initialization failed: ", e);
        }
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.btnSignUp.setOnClickListener(v -> {
            String email = binding.etEmail.getText().toString().trim();
            String password = binding.etPassword.getText().toString().trim();

            if (TextUtils.isEmpty(email) || TextUtils.isEmpty(password)) {
                Toast.makeText(getContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            if (password.length() < 6) {
                Toast.makeText(getContext(), "Password must be at least 6 characters", Toast.LENGTH_SHORT).show();
                return;
            }

            if (mAuth == null) {
                Toast.makeText(getContext(), "Firebase not configured. Please use Bypass.", Toast.LENGTH_LONG).show();
                return;
            }

            binding.btnSignUp.setEnabled(false);
            mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    binding.btnSignUp.setEnabled(true);
                    if (task.isSuccessful() && mAuth.getCurrentUser() != null) {
                        Toast.makeText(getContext(), "Account created successfully", Toast.LENGTH_SHORT).show();
                        Navigation.findNavController(view).navigate(R.id.createProfileFragment);
                    } else {
                        String errMsg = task.getException() != null ? task.getException().getMessage() : "Registration Failed";
                        Toast.makeText(getContext(), errMsg, Toast.LENGTH_LONG).show();
                    }
                });
        });

        binding.tvLoginLink.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.loginFragment)
        );

        binding.btnBypass.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.dashboardFragment)
        );
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
