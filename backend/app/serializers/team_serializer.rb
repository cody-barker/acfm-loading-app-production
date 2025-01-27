class TeamSerializer < ActiveModel::Serializer
  has_many :loading_lists
  attributes :id, :name
end