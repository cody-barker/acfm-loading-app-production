class LoadingListItemSerializer < ActiveModel::Serializer
  attributes :id, :loading_list_id, :item_id, :quantity, :loaded, :unloaded, :staged
  belongs_to :loading_list
  belongs_to :item
end
