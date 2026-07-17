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
import com.example.furcariskai.databinding.FragmentLoginBinding;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;

public class LoginFragment extends Fragment {
    private static final String TAG = "LoginFragment";
    private FragmentLoginBinding binding;
    private FirebaseAuth mAuth;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLoginBinding.inflate(inflater, container, false);
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

        binding.btnSignIn.setOnClickListener(v -> {
            String email = binding.etEmail.getText().toString().trim();
            String password = binding.etPassword.getText().toString().trim();

            if (TextUtils.isEmpty(email) || TextUtils.isEmpty(password)) {
                Toast.makeText(getContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            if (mAuth == null) {
                Toast.makeText(getContext(), "Firebase not configured. Please use Demo Bypass.", Toast.LENGTH_LONG).show();
                return;
            }

            binding.btnSignIn.setEnabled(false);
            mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    binding.btnSignIn.setEnabled(true);
                    if (task.isSuccessful() && mAuth.getCurrentUser() != null) {
                        String uid = mAuth.getCurrentUser().getUid();
                        // Check if user has details set up
                        FirebaseFirestore.getInstance().collection("users").document(uid).get()
                            .addOnCompleteListener(fsTask -> {
                                if (fsTask.isSuccessful() && fsTask.getResult() != null && fsTask.getResult().exists()) {
                                    Navigation.findNavController(view).navigate(R.id.dashboardFragment);
                                } else {
                                    Navigation.findNavController(view).navigate(R.id.createProfileFragment);
                                }
                            });
                    } else {
                        String errMsg = task.getException() != null ? task.getException().getMessage() : "Authentication Failed";
                        Toast.makeText(getContext(), errMsg, Toast.LENGTH_LONG).show();
                    }
                });
        });

        binding.tvSignUpLink.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.signUpFragment)
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
