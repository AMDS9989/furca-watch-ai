package com.example.furcariskai.ui.adapter;

import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.ItemPatientBinding;

import java.util.ArrayList;
import java.util.List;

public class PatientAdapter extends RecyclerView.Adapter<PatientAdapter.ViewHolder> {
    private List<Patient> list = new ArrayList<>();
    private final OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(Patient patient);
    }

    public PatientAdapter(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void setList(List<Patient> list) {
        this.list = list;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemPatientBinding binding = ItemPatientBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Patient item = list.get(position);
        holder.binding.tvPatientName.setText(item.getName());
        holder.binding.tvPatientId.setText("ID: " + item.getId());
        holder.binding.tvLastScan.setText("Last Scan: " + item.getDate());
        
        // Dynamic Risk Badge Color
        String r = item.getRiskScore() >= 75 ? "CRITICAL" : item.getRiskScore() >= 55 ? "HIGH" : item.getRiskScore() >= 35 ? "MODERATE" : "LOW";
        holder.binding.tvRiskBadge.setText(r);
        holder.binding.tvRiskScore.setText(String.format("%.1f%%", item.getRiskScore()));
        
        int colorRes = R.color.status_green;
        if (item.getRiskScore() >= 75) colorRes = R.color.status_critical;
        else if (item.getRiskScore() >= 55) colorRes = R.color.status_warning;
        else if (item.getRiskScore() >= 35) colorRes = R.color.status_warning;

        holder.binding.tvRiskBadge.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), colorRes));
        holder.itemView.setOnClickListener(v -> listener.onItemClick(item));
    }

    @Override
    public int getItemCount() {
        return list.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ItemPatientBinding binding;
        ViewHolder(ItemPatientBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
