package com.example.furcariskai.ui.adapter;

import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.furcariskai.databinding.ItemTimelineBinding;

import java.util.ArrayList;
import java.util.List;

public class TimelineAdapter extends RecyclerView.Adapter<TimelineAdapter.ViewHolder> {
    private List<String> dates = new ArrayList<>();
    private List<String> events = new ArrayList<>();
    private List<String> descs = new ArrayList<>();

    public TimelineAdapter() {}

    public void setData(List<String> dates, List<String> events, List<String> descs) {
        this.dates = dates;
        this.events = events;
        this.descs = descs;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemTimelineBinding binding = ItemTimelineBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.binding.tvDate.setText(dates.get(position));
        holder.binding.tvTitle.setText(events.get(position));
        holder.binding.tvDesc.setText(descs.get(position));
    }

    @Override
    public int getItemCount() {
        return events.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ItemTimelineBinding binding;
        ViewHolder(ItemTimelineBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
