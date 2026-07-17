package com.example.furcariskai.ui.fragment;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.furcariskai.databinding.FragmentAiAssistantBinding;

public class AIAssistantFragment extends Fragment {
    private FragmentAiAssistantBinding binding;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAiAssistantBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Preloaded system messages
        appendMessage("FurcaRisk Diagnostic AI is online. Ask anything about Hamp/Glickman classifications.", false);

        binding.btnSend.setOnClickListener(v -> {
            String text = binding.etMessage.getText().toString().trim();
            if (!text.isEmpty()) {
                appendMessage(text, true);
                binding.etMessage.setText("");
                handler.postDelayed(() -> replyToUserQuery(text), 800);
            }
        });

        // Suggestion Chips
        binding.chipHamp.setOnClickListener(v -> {
            appendMessage("Explain Hamp Grade II classification", true);
            handler.postDelayed(() -> replyToUserQuery("Hamp Grade II"), 800);
        });

        binding.chipTherapies.setOnClickListener(v -> {
            appendMessage("What are the surgical therapies for furcation?", true);
            handler.postDelayed(() -> replyToUserQuery("surgical therapies"), 800);
        });
    }

    private void appendMessage(String message, boolean isUser) {
        if (binding == null) return;
        TextView tv = new TextView(getContext());
        tv.setText(isUser ? "You: " + message : "AI: " + message);
        tv.setPadding(12, 12, 12, 12);
        tv.setTextColor(isUser ? Color.parseColor("#00F0FF") : Color.WHITE);
        binding.layoutChatLogs.addView(tv);
        binding.scrollViewChat.post(() -> binding.scrollViewChat.fullScroll(View.FOCUS_DOWN));
    }

    private void replyToUserQuery(String query) {
        String q = query.toLowerCase();
        String reply = "I am trained to explain early furcation risk parameters, Glickman/Hamp classifications, and periodontal therapeutics.";
        
        if (q.contains("hamp") || q.contains("grade")) {
            reply = "Hamp's Classification divides furcations into: Grade I (<3mm horizontal loss), Grade II (>3mm horizontal loss), and Grade III (through-and-through).";
        } else if (q.contains("surgical") || q.contains("treatment") || q.contains("therapy")) {
            reply = "Grade II furcations are highly responsive to Guided Tissue Regeneration (GTR) surgical membranes and particulate bone grafting.";
        } else if (q.contains("smoking") || q.contains("diabetes")) {
            reply = "Smoking induces local microvascular vasoconstriction, limiting healing. Uncontrolled diabetes (HbA1c > 7) activates bone osteoclast resorption.";
        }

        appendMessage(reply, false);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
