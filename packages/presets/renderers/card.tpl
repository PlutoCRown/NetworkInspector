<style>
  .ni-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }
  .ni-card__hit {
    padding: 10px 12px;
    cursor: pointer;
    transition: box-shadow 0.15s ease;
  }
  .ni-card__hit:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
  .ni-card__title {
    font-weight: 600;
    font-size: 13px;
    line-height: 1.4;
  }
  .ni-card__title[data-tone="danger"] {
    color: #dc2626;
  }
  .ni-card__title[data-tone="success"] {
    color: #16a34a;
  }
  .ni-card__desc {
    margin-top: 4px;
    font-size: 12px;
    color: #6b7280;
  }
  .ni-card__meta {
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 10px;
    color: #9ca3af;
  }
  .ni-card__url {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .ni-expand-outer {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s ease-out;
  }
  .ni-expand-outer[data-expanded="true"] {
    grid-template-rows: 1fr;
  }
  .ni-expand-inner {
    overflow: hidden;
  }
  .ni-expand-body {
    padding: 0 12px 10px;
    border-top: 1px dashed #e5e7eb;
  }
  .ni-expand-body pre {
    margin: 8px 0 0;
    font-size: 11px;
    font-family: ui-monospace, monospace;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 12rem;
    overflow: auto;
    background: #f3f4f6;
    padding: 8px;
    border-radius: 6px;
  }
  .ni-popover-content pre {
    font-size: 11px;
    font-family: ui-monospace, monospace;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }
</style>
<article x-card class="ni-card">
  <div class="ni-card__hit">
    <div x-title class="ni-card__title">{{title}}</div>
    <div x-title highlight class="ni-card__title">{{title}}</div>
    <div x-if="desc" class="ni-card__desc">{{desc}}</div>
    <div class="ni-card__meta">
      <span class="ni-card__url">{{__REQUEST_URL__}}</span>
      <span>{{__TIME__}}</span>
    </div>
  </div>
  <div x-expand class="ni-expand-outer">
    <div class="ni-expand-inner">
      <div class="ni-expand-body"><pre>{{expend}}</pre></div>
    </div>
  </div>
</article>
<div x-popover class="ni-popover-content"><pre>{{popover}}</pre></div>
