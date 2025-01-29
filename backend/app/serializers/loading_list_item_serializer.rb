class LoadingListItemSerializer < ActiveModel::Serializer
  attributes :id, :loading_list_id, :item_id, :quantity
  belongs_to :loading_lists
  belongs_to :items
end