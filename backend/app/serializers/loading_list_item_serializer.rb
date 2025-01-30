class LoadingListItemSerializer < ActiveModel::Serializer
  attributes :id, :loading_list_id, :item_id, :quantity
  belongs_to :loading_list
  belongs_to :item, serializer: ItemSerializer
end