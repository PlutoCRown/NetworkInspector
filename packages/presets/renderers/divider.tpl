<style>
  .ni-divider {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    font-size: 11px;
    color: #6b7280;
  }
  .ni-divider__line {
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  .ni-divider__title {
    padding: 0 4px;
    white-space: nowrap;
    font-weight: 500;
  }
</style>
<div x-divider class="ni-divider">
  <span class="ni-divider__line"></span>
  <span class="ni-divider__title">{{title}}</span>
  <span class="ni-divider__line"></span>
</div>
