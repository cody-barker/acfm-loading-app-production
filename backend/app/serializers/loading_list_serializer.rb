class LoadingListSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :team_id, :site_name, :date, :return_date, :notes
  belongs_to :user
  belongs_to :team
  has_many :loading_list_items
  # Ensure `items` are eagerly loaded along with `loading_list_items`
  # def loading_list_items
  #   object.loading_list_items.includes(:item).map do |loading_list_item|
  #     LoadingListItemSerializer.new(loading_list_item).as_json
  #   end
  # end
end
