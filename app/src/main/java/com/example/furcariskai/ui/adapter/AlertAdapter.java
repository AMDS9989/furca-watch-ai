package com.example.furcariskai.ui.adapter;

import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Notification;
import com.example.furcariskai.databinding.ItemAlertBinding;

import java.util.ArrayList;
import java.util.List;

public class AlertAdapter extends RecyclerView.Adapter<AlertAdapter.ViewHolder> {
    private List<Notification> list = new ArrayList<>();
    private final OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(Notification notification);
    }

    public AlertAdapter(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void setList(List<Notification> list) {
        this.list = list;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemAlertBinding binding = ItemAlertBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Notification item = list.get(position);
        holder.binding.tvAlertTitle.setText(item.getPatientName() + " (" + item.getAlertType() + ")");
        holder.binding.tvAlertMsg.setText(item.getMessage());
        holder.binding.tvAlertTime.setText(item.getTimestamp());
        
        int colorRes = R.color.status_warning;
        if (item.getAlertType().equalsIgnoreCase("CRITICAL")) {
            colorRes = R.color.status_critical;
        } else if (item.getAlertType().equalsIgnoreCase("SYSTEM")) {
            colorRes = R.color.primary_cyan;
        }
        holder.binding.tvAlertTitle.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), colorRes));
        
        holder.itemView.setOnClickListener(v -> listener.onItemClick(item));
    }

    @Override
    public int getItemCount() {
        return list.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ItemAlertBinding binding;
        ViewHolder(ItemAlertBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
